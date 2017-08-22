var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');


let io = null;


console.emit = function emit(...args) {
    console.log(...args);
    io.emit('log', args.join(' '));
};

class Spreadsheet {
    constructor() {



    }
}


let auth = null;


const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE) + '/.credentials/';

console.log('TOKEN_DIR: ', TOKEN_DIR);

const TOKEN_PATH = TOKEN_DIR + 'sheets.googleapis.com-nodejs-quickstart.json';

fs.readFile('client_secret.json', function processClientSecrets(err, content) {
    if (err) {
        console.log('Error loading client secret file: ' + err);
        return;
    }
    // Authorize a client with the loaded credentials, then call the
    // Google Sheets API.
    authorize(JSON.parse(content), listMajors);
});


function authorize(credentials, callback) {

    console.log('Authorize: ', credentials);

    var clientSecret = credentials.installed.client_secret;
    var clientId = credentials.installed.client_id;
    var redirectUrl = credentials.installed.redirect_uris[0];
    var auth = new googleAuth();
    var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, function(err, token) {


        // heroku
        if (process.env.CREDENTIALS) {

            token = process.env.CREDENTIALS;

        }

        oauth2Client.credentials = JSON.parse(token);

        callback(oauth2Client);


    });
}



function getNewToken(oauth2Client, callback) {

    var authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
    });

    console.log('Authorize this app by visiting this url: ', authUrl);
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question('Enter the code from that page here: ', function(code) {
        rl.close();
        oauth2Client.getToken(code, function(err, token) {
            if (err) {
                console.log('Error while trying to retrieve access token', err);
                return;
            }
            oauth2Client.credentials = token;
            storeToken(token);
            callback(oauth2Client);
        });
    });
}


function storeToken(token) {
    try {
        fs.mkdirSync(TOKEN_DIR);
    } catch (err) {
        if (err.code != 'EEXIST') {
            throw err;
        }
    }
    fs.writeFile(TOKEN_PATH, JSON.stringify(token));
    console.log('Token stored to ' + TOKEN_PATH);
}

__auth = null;

function waitAuthorize() {
    return new Promise((resolve) => {
        const dispose = setInterval(() => {
            if (!__auth) return console.log('Authorize...');
            clearInterval(dispose);
            resolve();
        }, 100);
    });
}

module.exports = {

    async create() {

        // authorize が終わるまで待つ
        await waitAuthorize();


        const sheets = google.sheets('v4');


        const request = {
            resource: {},
            auth: __auth
        };


        const result = await new Promise((resolve) => {

            sheets.spreadsheets.create(request, (err, response) => {

                if (err) return resolve(response);

                resolve(response);

            });

        });

        return result;

    },

    async update(id, retweeters, _io) {

        // socket.io を保持
        io = _io;

        await waitAuthorize();

        io.emit('spreadsheet-begin');

        const sheets = google.sheets('v4');


        const request = {
            spreadsheetId: id,
            auth: __auth,
            resource: {
                requests: [{
                    updateSpreadsheetProperties: {
                        properties: {
                            title: Date()
                        },
                        fields: 'title'
                    }
                }]
            }
        };



        const result = await new Promise((resolve) => {
            sheets.spreadsheets.batchUpdate(request, (err, response) => {
                if (err) return resolve(err);
                resolve(response);
            });
        });

        console.log('スプレッドシートのタイトルを変更しました', result);


        let rows = [];


        const header = (['ツイート ID', '名前', '@ID', 'RT 時刻', 'フォロー', 'フォロワー', 'FF 比', '🐴']).map((v) => {
            return {
                userEnteredValue: { stringValue: v }
            };
        });

        function toString(text) {
            return text ? text.toString() : 'null'
        }

        function retweetersToRow(r) {
            return [

                { userEnteredValue: { stringValue: toString(r.id) } },
                { userEnteredValue: { stringValue: toString(r.name) } },
                { userEnteredValue: { stringValue: toString(r.screen_name) } },
                { userEnteredValue: { stringValue: toString(r.created_at) } },

                { userEnteredValue: { numberValue: (r.friends_count) || -2 } },
                { userEnteredValue: { numberValue: (r.followers_count) || -2 } },
                { userEnteredValue: { numberValue: r.followers_count <= 0 ? 0.0 : ((r.followers_count / r.friends_count) || 0.0) } },

                { userEnteredValue: { stringValue: toString(r.invalid) } }

            ];
        }

        rows.push({ values: header });

        for (const retweeter of retweeters) {

            const row = retweetersToRow(retweeter);

            // console.log(row);

            rows.push({ values: row });

        }


        const rowCount = rows.length;


        // Row を拡張する
        const _request = {
            spreadsheetId: id,
            auth: __auth,
            resource: {
                requests: [{
                    updateSheetProperties: {
                        properties: {
                            gridProperties: {
                                rowCount,
                                columnCount: 8
                            }
                        },
                        fields: 'gridProperties'
                    }
                }]
            }
        };
        const _result = await new Promise((resolve) => {
            sheets.spreadsheets.batchUpdate(_request, (err, response) => {
                if (err) return resolve(err);
                resolve(response);
            });
        });

        console.log('Row を拡張しました', _result);




        const n = 999;

        let index = 0;

        // 1000 以上の row は更新できないので分割する
        while (rows.length) {

            const v = rows.slice(0, n);

            const test = {
                requests: [{
                    updateCells: {
                        start: {
                            sheetId: 0,
                            rowIndex: index,
                            columnIndex: 0
                        },
                        rows: v,
                        fields: 'userEnteredValue'
                    }
                }]
            };



            const result2 = await new Promise((resolve) => {

                sheets.spreadsheets.batchUpdate({

                    spreadsheetId: id,
                    auth: __auth,
                    resource: test

                }, (err, response) => {

                    if (err) return resolve(err);

                    resolve(response);

                });

            });

            console.emit(result2);


            console.emit('spreadsheet progress:', index + '/' + rowCount);

            rows = rows.slice(n);
            index += n;
        }




        console.log('スプレッドシートデータを更新しました');

        io.emit('spreadsheet-end');




    }

};


function listMajors(auth) {

    __auth = auth;

    return;




    sheets.spreadsheets.values.get({
        auth: auth,
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        range: 'Class Data!A2:E',
    }, function(err, response) {
        if (err) {
            console.log('The API returned an error: ' + err);
            return;
        }
        var rows = response.values;
        if (rows.length == 0) {
            console.log('No data found.');
        } else {
            console.log('Name, Major:');
            for (var i = 0; i < rows.length; i++) {
                var row = rows[i];
                // Print columns A and E, which correspond to indices 0 and 4.
                console.log('%s, %s', row[0], row[4]);
            }
        }
    });
}
