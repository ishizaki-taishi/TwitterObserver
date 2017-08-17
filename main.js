const port = process.env.PORT || 3000;


const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
io.listen(http);
app.use(express.static('public'));


process.on('unhandledRejection', console.dir);


const DATABASE_CAPACITY = 10000;


const MAX_REQUEST_COUNT = 300;


function escapeSQL(text) {
    return text.replace(/'/g, `''`);
}

io.emit('restart');



const interval = Math.floor(60 * 15 / (MAX_REQUEST_COUNT * 0.5) * 1000);

const RequestInterval = {
    StatusesRetweetersIds: 180000 // 3 分
};

const path = require('path');

const databaseURL = 'postgres://zsmdfzjfczrdyi:16cdebdfc49073acbdb90c47a098d14bdd4a6bf5d6ee3ca31e0ee5c3c49e4804@ec2-54-221-221-153.compute-1.amazonaws.com:5432/d4k46sqvuojehi';


function pgFormatDate(date) {
    /* Via http://stackoverflow.com/questions/3605214/javascript-add-leading-zeroes-to-date */
    function zeroPad(d) {
        return ("0" + d).slice(-2)
    }
    var parsed = new Date(date)
    return [parsed.getUTCFullYear(), zeroPad(parsed.getMonth() + 1), zeroPad(parsed.getDate()), zeroPad(parsed.getHours()), zeroPad(parsed.getMinutes()), zeroPad(parsed.getSeconds())].join(" ");
}


const Twitter = require('twitter');
const client = new Twitter({
    consumer_key: 'KBARD1nq3jV1rrxPg9eHAvavo',
    consumer_secret: 'HeCtqZag01SZmbbbIV7WWX0glX44RqGCtBa28qMMnSWecKarIL',
    access_token_key: '294436176-0esY5xOKLsmaGolQ1F6P5G2nGpdgrlzsvmnXteHC',
    access_token_secret: 'KlpgzZcHsx9ciOu9fDxCuBrUqmE3LtlVJ0ML6E8rnkxj9'
});

console.log('init');


const { Pool, Client } = require('pg')
const connectionString = process.env.DATABASE_URL || databaseURL;
const pool = new Pool({
    connectionString: connectionString,
    ssl: true
});
const dbClient = new Client({
    connectionString: connectionString,
    ssl: true

});
dbClient.connect()


function query(query) {
    return new Promise((resolve) => {
        dbClient.query(query, (e, res) => {
            resolve({
                error: e,
                response: res
            });
        });
    });
}



function dbQuery(query) {
    return new Promise((resolve) => {
        dbClient.query(query, (error, response) => {
            if (error) throw error;

            Object.defineProperty(response, 'value', {
                get() {
                    // 結果が 1 件だけなら value で取得可能
                    if (response.rowCount !== 1) throw response;
                    return response.rows[0];
                }
            });

            resolve(response);
        });
    });
}




let observeTweets = [];


function getObserveTweetIds() {
    return observeTweets;
}



const { create, update } = require('./spreadsheet');

// リツイート情報をスプレッドシートに反映する
async function writeSpreadsheet(id) {

    console.log('スプレッドシートに書き込みます');

    const { spreadsheet_id } = (await query(`SELECT * FROM observe_tweets WHERE id = '${id}'`)).response.rows[0];

    const retweeters = (await query(`SELECT * FROM retweeters WHERE target_id = '${id}'`)).response.rows;

    const result = await update(spreadsheet_id, retweeters, io);

    console.log('スプレッドシートに書き込みました', result);

}


async function updateObserveTweets() {

    const { response } = await query('SELECT * FROM observe_tweets');


    for (const row of response.rows) {

        console.log('監視対象ツイートを更新します');

        const { response } = await query(`SELECT spreadsheet_id FROM observe_tweets WHERE id = '${row.id}'`);

        // スプレッドシートが生成されていない
        if (!response.rows[0].spreadsheet_id) {

            console.log('スプレッドシートが生成されていません: ', row.id);

            // スプレッドシートを作成して DB に登録する
            const { spreadsheetId } = await create();

            await query(`UPDATE observe_tweets SET spreadsheet_id = '${spreadsheetId}' WHERE id = '${row.id}'`);

            console.log('スプレッドシート ID を登録しました: ', spreadsheetId);

        }

    }


    observeTweets = response.rows.map((row) => row.id);

}





async function getRT() {

    await updateObserveTweets();

    try {

        console.log('監視するツイート一覧: ', observeTweets);

        io.emit('log', 'DB Connection' + connectionString);

        let index = 0;

        for (const id of getObserveTweetIds()) {

            ++index;


            const targetID = id;

            // RT 情報を取得する
            const response = await get('statuses/retweets/' + id, { id, count: 100, trim_user: false });


            io.emit('log', response);


            for (const status of response) {

                const user = status.user;

                // RT したユーザーの内部 ID
                const userID = user.id_str;

                // 正常に取得できた場合、既に登録されている

                const { error, response } = await query(`SELECT FROM retweeters WHERE target_id = '${targetID}' AND id = '${userID}'`);
                if (!error && response.rowCount) {
                    console.log(`重複: @${index} ${userID}`);
                    continue;
                }

                console.log('リツイーターを取得しました: ', userID);
                io.emit('log', `user id: ${userID}`);


                const createdAt = pgFormatDate(status.created_at);


                const res = await query(`

                    INSERT INTO retweeters
                        (id, target_id, created_at)
                        VALUES
                        ('${userID}', '${targetID}', to_timestamp('${createdAt}', 'YYYY MM DD HH24 MI SS'))

                `);



            }





        }
    } catch (e) {
        console.error(e);
        io.emit('error', e);
    }


}



// beta
getRT();
setInterval(getRT, RequestInterval.StatusesRetweetersIds * 2);



async function fetchUserStatus() {

    // 全てのリツイーター（全ての監視ツイート）から情報を取得できていない 1 ユーザーを取得する
    const w = await query('SELECT * FROM retweeters WHERE invalid IS NULL OR friends_count IS NULL LIMIT 1');

    if (w.error) return;
    if (!w.response.rowCount) return;

    const userID = w.response.rows[0].id;


    try {

        // users/show API からユーザー情報を取得する
        let { name, screen_name, friends_count, followers_count } = await get('users/show', { user_id: userID });

        // 名前に ' などが入っていると SQL 文が壊れる
        name = escapeSQL(name);

        // ユーザー情報を反映
        const r = await query(`UPDATE retweeters SET name = '${name}', screen_name = '${screen_name}', friends_count = ${friends_count}, followers_count = ${followers_count}, invalid = FALSE WHERE id = '${userID}'`);
        console.log('ユーザー名を取得しました', userID, '@' + screen_name); //, r);
    }

    // ユーザーが存在しない
    catch (e) {

        // 不正ユーザー値を登録
        const r = await query(`UPDATE retweeters SET invalid = TRUE, friends_count = -1, followers_count = -1 WHERE id = '${userID}'`);
        console.log('ユーザー名の取得に失敗しました', userID); //, r);

    }


}



fetchUserStatus();
setInterval(fetchUserStatus, 3000 * 2);



class DB {

    constructor() {

    }


}





io.sockets.on('connection', async(socket) => {



    io.emit('log', `API Interval: ${interval}`);


    // DB のキャパシティを確認
    (async() => {

        // リツイート情報の総数
        const { value } = await dbQuery('SELECT COUNT(*) FROM retweeters');

        io.emit('database-capacity', {
            max: DATABASE_CAPACITY,
            count: parseInt(value.count)
        });

        console.log('DB COUNT: ', value);

    })();


    (async() => {

        let test = [];


        for (const id of observeTweets) {

            const { html } = await get('statuses/oembed', {
                url: `https://twitter.com/_/status/${id}`
            });

            console.log('oembed');

            test.push({
                id,
                oembed: html
            });
        }
        io.emit('observe-tweets', test);


    })();


    // FF 取得情報を投げる
    (async() => {
        const { response } = await query(`SELECT * FROM retweeters WHERE friends_count IS NOT NULL`);
        io.emit('ff-checked', response.rowCount);
    })();



    // スプレッドシート情報を投げる
    (async() => {

        const { response } = await query(`SELECT * FROM observe_tweets WHERE spreadsheet_id IS NOT NULL`);

        for (const observe of response.rows) {

            io.emit('spreadsheet', observe);

        }

    })();



    // リツイーターの情報を投げる
    (async() => {

        for (const id of getObserveTweetIds()) {

            const { response } = await query(`SELECT * FROM retweeters WHERE target_id = '${id}'`);

            io.emit('retweeters', {
                id,
                retweeters: response.rows
            });

        }

    })();



    socket.on('add-target-tweet', (id) => {

        dbClient.query(`INSERT INTO observe_tweets (id) VALUES ('${id}')`, (err, res) => {

            updateObserveTweets();

            io.emit('log', { err, res });

        });

    });



    socket.on('lottery-oembed', async(screenName) => {

        const res = await get('search/tweets', {
            q: 'from:tantoraDREAM filter:retweets @dabisto_jp ダビストティザー公開記念キャンペーン', //`from:${screenName}`,
            count: 1
        });


        console.log('抽選結果の oembed を取得します: ', res.statuses[0].retweeted_status);
        /*
         */
        // console.log('oembed を取得しました: ', html);

        // const id = res.statuses[0].id_str;
        const id = res.statuses[0].retweeted_status.id_str;


        const { html } = await get('statuses/oembed', {
            url: `https://twitter.com/_/status/${id}`
        });

        io.emit('lottery-oembed', html);
    });


    socket.on('spreadsheet', (id) => {
        writeSpreadsheet(id);
    });



    socket.on('remove-target-tweet', (id) => {

        console.info('remove: ' + id);

        dbClient.query(`DELETE FROM observe_tweets WHERE id = '${id}'`, (err, res) => {


            updateObserveTweets();


            io.emit('log', { err, res });

            console.log(err, res);

        });

    });





});

function get(api, params) {
    return new Promise((resolve, reject) => {
        client.get(api, params, (e, t, r) => {
            if (e) {
                console.error(e);
                reject(e);
            }
            resolve(t);
        });
    });
}


app.get('/', async(req, res) => {
    res.sendFile(path.resolve(__dirname, 'index.html'));
});

http.listen(port, function() {
    console.log(`App listening on port ${port}`);
});
