const port = process.env.PORT || 3000;

const express = require('express');

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

io.listen(http);


//
process.on('unhandledRejection', console.dir);



app.use(express.static('public'));


const { QueryString } = require('./utils');



const MAX_REQUEST_COUNT = 300;


function escapeSQL(text) {
    return text.replace(/'/g, `''`);
}



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


let lastRetweetUserID = null;
/*
dbClient.query(`SELECT id FROM retweeters ORDER BY created_at DESC LIMIT 3`, (e, res) => {
    lastRetweetUserID = res.rows[0].id;
    lastRetweetUserID = '894812207384379392';
});
*/

/* 重複削除

CREATE TEMPORARY TABLE fruits3_tmp AS SELECT MIN(id), id FROM retweeters GROUP BY id;
DELETE FROM retweeters;
INSERT INTO retweeters SELECT * FROM fruits3_tmp;
DROP TABLE fruits3_tmp;

*/


let observeTweets = [];



const { create, update } = require('./spreadsheet');

// リツイート情報をスプレッドシートに反映する
async function writeSpreadsheet() {

    console.log('スプレッドシートに書き込みます');

    const { spreadsheet_id } = (await query('SELECT * FROM observe_tweets')).response.rows[0];

    const retweeters = (await query('SELECT * FROM retweeters')).response.rows;

    const result = await update(spreadsheet_id, retweeters);

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

        for (const id of observeTweets) {

            const targetID = id;

            // RT 情報を取得する
            // const response = await get('statuses/retweeters/ids', { id, stringify_ids: true });
            const response = await get('statuses/retweets/' + id, { id, count: 100, trim_user: false });


            io.emit('log', response);


            for (const status of response) {

                const user = status.user;

                // RT したユーザーの内部 ID
                const userID = user.id_str;

                console.log('UserID: ', userID);


                const r = await query(`DELETE FROM retweeters WHERE id = '${userID}'`);

                if (r.response.rawCount) console.log('重複: ', r);




                io.emit('log', `user id: ${userID}`);


                const createdAt = pgFormatDate(status.created_at);


                const res = await query(`

                    INSERT INTO retweeters
                        (id, target_id, created_at)
                        VALUES
                        ('${userID}', '${targetID}', to_timestamp('${createdAt}', 'YYYY MM DD HH24 MI SS'))

                `);



            }


            // 最後に RT したユーザーを更新
            lastRetweetUserID = response[0].user.id_str;



        }
    } catch (e) {
        console.error(e);
        io.emit('error', e);
    }


    /*
        dbClient.query(`
            CREATE TEMPORARY TABLE _temp AS SELECT MIN(id), id FROM retweeters GROUP BY id;
            DELETE FROM retweeters;
            INSERT INTO retweeters SELECT * FROM _temp;
            DROP TABLE _temp;

            `, (err, result) => {
            console.log(err, result);
        });
    */



}



// beta
getRT();
setInterval(getRT, RequestInterval.StatusesRetweetersIds);



async function fetchUserStatus() {

    const w = await query('SELECT * FROM retweeters WHERE invalid IS NULL LIMIT 1');

    if (w.error) return;

    const userID = w.response.rows[0].id;


    try {

        let { name, screen_name } = await get('users/show', { user_id: userID });

        name = escapeSQL(name);

        const r = await query(`UPDATE retweeters SET name = '${name}', screen_name = '${screen_name}', invalid = FALSE WHERE id = '${userID}'`);
        console.log('ユーザー名を取得しました', userID);//, r);
    }

    // ユーザーが存在しない
    catch (e) {

        const r = await query(`UPDATE retweeters SET invalid = TRUE WHERE id = '${userID}'`);
        console.log('ユーザー名の取得に失敗しました', userID);//, r);

    }




}


fetchUserStatus();
setInterval(fetchUserStatus, 5000);


io.sockets.on('connection', async(socket) => {


    io.emit('log', 'Last RT: ' + lastRetweetUserID);


    io.emit('log', `API Interval: ${interval}`);


    //    return;

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


    // スプレッドシート情報を投げる
    (async() => {

        const { response } = await query(`SELECT * FROM observe_tweets WHERE spreadsheet_id IS NOT NULL`);

        for (const observe of response.rows) {

            io.emit('spreadsheet', observe);

        }

    })();



    (async() => {

        const { response } = await query(`SELECT * FROM retweeters WHERE invalid IS NULL OR invalid = FALSE`);
        // const { response } = await query(`SELECT * FROM retweeters`);


        io.emit('retweeters', response.rows);

    })();


    socket.on('add-target-tweet', (id) => {

        dbClient.query(`INSERT INTO observe_tweets (id) VALUES (${id})`, (err, res) => {

            updateObserveTweets();

            io.emit('log', { err, res });

        });

    });


    socket.on('spreadsheet', () => {
        writeSpreadsheet();
    });



    socket.on('remove-target-tweet', (id) => {

        console.info('remove: ' + id);

        dbClient.query(`DELETE FROM observe_tweets WHERE id = '${id}'`, (err, res) => {


            updateObserveTweets();


            io.emit('log', { err, res });

            console.log(err, res);

        });

    });



    socket.on('TEST', async() => {

        var result = [];

        const id = '894751560403632128';

        const res = await get('search/tweets', {

            q: 'Switch filter:retweets @dabisto_jp',
            count: 100,
            since_id: id

        });

        result.push(...res.statuses);

        let next = res.search_metadata.next_results;

        while (true) {
            const params = QueryString.parse(next.substr(1));
            const res2 = await get('search/tweets', params);
            next = res2.search_metadata.next_results;

            result.push(...res2.statuses);
            if (!next) break;

        }

        io.emit('log', result);

        io.emit('log', '検索情報からテーブルを更新します');

        let _count = 0;

        for (var w of result) {

            //            w.created_at;

            //            w.user.id_str

            const userID = w.user.id_str;

            console.log(userID);

            const w2 = await query(`SELECT * FROM retweeters WHERE id = '${userID}'`);

            io.emit('log', 'ID チェック: ' + (++_count));
            // 既に存在している
            if (w2.response.rowCount) continue;

            io.emit('log', '登録されていないユーザーです！: ' + userID);

            const createdAt = pgFormatDate(w.created_at);


            await query(`

                                INSERT INTO retweeters
                                    (id, created_at)
                                    VALUES
                                    ('${userID}', to_timestamp('${createdAt}', 'YYYY MM DD HH24 MI SS'))

                            `);

        }


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
    console.log('Example app listening on port 3000!');
});
