const fs = require('mz/fs');
const readline = require('readline');
const google = require('googleapis');
const googleAuth = require('google-auth-library');

let io = null;

console.emit = function emit(...args) {
    console.log(...args);
    io.emit('log', args.join(' '));
};

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

const HOME = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
const TOKEN_DIR = HOME + '/.credentials/';
const TOKEN_PATH = TOKEN_DIR + 'sheets.googleapis.com-nodejs-quickstart.json';


class Spreadsheet {

    /**
     * スプレッドシート API の認証を行う
     * @return {Promise} Promise
     */
    static async initialize() {

        if (Spreadsheet.auth) return;

        console.log('CLIENT_SECRET: ', process.env.CLIENT_SECRET);
        console.log('CREDENTIALS: ', process.env.CREDENTIALS);

        let cs = '';

        // heroku
        if (process.env.CLIENT_SECRET) {
            cs = process.env.CLIENT_SECRET;
        }
        // local
        else {
            cs = await fs.readFile('client_secret.json');
        }

        const clientSecretData = JSON.parse(cs);

        const clientId = clientSecretData.installed.client_id;
        const clientSecret = clientSecretData.installed.client_secret;
        const redirectUrl = clientSecretData.installed.redirect_uris[0];

        const auth = new googleAuth();
        const client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

        let token = '';

        // heroku
        if (process.env.CREDENTIALS) {
            token = process.env.CREDENTIALS;
        }
        // local
        else {
            token = await fs.readFile(TOKEN_PATH);
        }


        client.credentials = JSON.parse(token);

        Spreadsheet.auth = client;

    }

    /**
     * 新規スプレッドシートを生成する
     * @return {Promise} Promise
     */
    static async create() {

        // authorize が終わるまで待つ
        await Spreadsheet.initialize();

        const sheets = google.sheets('v4');


        const request = {
            resource: {},
            auth: Spreadsheet.auth
        };


        const result = await new Promise((resolve) => {

            sheets.spreadsheets.create(request, (err, response) => {

                if (err) return resolve(response);

                resolve(response);

            });

        });

        return result;

    }


    /**
     * スプレッドシートを更新する
     * @return {Promise} Promise
     */
    static async update(id, retweeters, _io) {

        // socket.io を保持
        io = _io;

        await Spreadsheet.initialize();

        io.emit('spreadsheet-begin');

        const sheets = google.sheets('v4');

        const request = {
            spreadsheetId: id,
            auth: Spreadsheet.auth,
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
            auth: Spreadsheet.auth,
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
                    auth: Spreadsheet.auth,
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



module.exports = Spreadsheet;



/* Spreadsheet を読み込むサンプル
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
*/
