const port = process.env.PORT || 3000;


const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const path = require('path');

io.listen(http);

app.use(express.static('public'));
app.use(express.static('dist'));


const google = require('googleapis');
// var OAuth2 = google.auth.OAuth2;


console.log(google);


app.get('/', async(req, res) => {
    res.sendFile(path.resolve(__dirname, 'index.html'));
});

http.listen(port, () => {
    console.log(`App listening on port ${port}`);
});


process.on('unhandledRejection', console.dir);


const Twitter = require('./server/twitter');
const Spreadsheet = require('./server/spreadsheet');


const get = Twitter.get;


const DATABASE_CAPACITY = 10000;


const MAX_REQUEST_COUNT = 300;


/**
 * ' を '' に置換する
 * @param  {String} text SQL クエリ
 * @return {String}      エスケープされた SQL クエリ
 */
function escapeSQL(text) {
    return text.replace(/'/g, `''`);
}



io.emit('restart');


const interval = Math.floor(60 * 15 / (MAX_REQUEST_COUNT * 0.5) * 1000);

const RequestInterval = {
    StatusesRetweetersIds: 180000 // 3 分
};




function pgFormatDate(date) {
    /* Via http://stackoverflow.com/questions/3605214/javascript-add-leading-zeroes-to-date */
    function zeroPad(d) {
        return ("0" + d).slice(-2)
    }
    var parsed = new Date(date)
    return [parsed.getUTCFullYear(), zeroPad(parsed.getMonth() + 1), zeroPad(parsed.getDate()), zeroPad(parsed.getHours()), zeroPad(parsed.getMinutes()), zeroPad(parsed.getSeconds())].join(" ");
}


const DB = require('./server/db');

const dbClient = DB.$client;
const query = DB.$query;
const dbQuery = DB.$dbQuery;

console.log('init');



let observeTweets = [];


function getObserveTweetIds() {
    return observeTweets;
}




// リツイート情報をスプレッドシートに反映する
async function writeSpreadsheet(id) {

    console.log('スプレッドシートに書き込みます');

    const { spreadsheet_id } = (await query(`SELECT * FROM observe_tweets WHERE id = '${id}'`)).response.rows[0];

    const retweeters = (await query(`SELECT * FROM retweeters WHERE target_id = '${id}'`)).response.rows;

    await Spreadsheet.update(spreadsheet_id, retweeters, io);

    console.log('スプレッドシートに書き込みました');

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
            const { spreadsheetId } = await Spreadsheet.create();

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




io.sockets.on('connection', async(socket) => {


    function response(name, callback) {

        socket.on(name, async($name, ...args) => {

            const result = await callback(...args);

            socket.emit($name, result);

        });

    }




    response('GET_TWEETS', () => {

        const tweetIds = observeTweets;

        const tweets = observeTweets.map((id) => ({ id }));

        return tweets;

    });


    response('GET_RETWEETERS', async(tweetId) => {

        const { rows } = await DB.query(`SELECT * FROM retweeters WHERE target_id = '${tweetId}'`);

        return rows;

    });


    response('GET_OEMBED', async(id) => {

        const { html } = await Twitter.get('statuses/oembed', {
            url: `https://twitter.com/_/status/${id}`
        });

        return html;

    });



    // ブラックリスト
    (async() => {

        const { rows } = await DB.query('SELECT * FROM blacklist');

        socket.emit('blacklist', rows.map((row) => row.id));

    })();

    // DB のキャパシティを確認
    (async() => {

        // リツイート情報の総数
        const { value } = await DB.query('SELECT COUNT(*) FROM retweeters');

        socket.emit('database-capacity', {
            max: DATABASE_CAPACITY,
            count: parseInt(value.count)
        });

        console.log('DB COUNT: ', value);

    })();


    // 埋め込みツイートを生成して投げる
    (async() => {

        let test = [];

        for (const id of observeTweets) {

            const { html } = await get('statuses/oembed', {
                url: `https://twitter.com/_/status/${id}`
            });

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


    socket.on('create-spreadsheet-from-users', async(users) => {

        console.log('create-spreadsheet-from-users');

        const { spreadsheetId } = await Spreadsheet.create();

        await Spreadsheet.update(spreadsheetId, users, io);

        socket.emit('create-spreadsheet-from-users', spreadsheetId);

    });


    /*
        socket.on('', (id) => {

            // スプレッドシートを作成して DB に登録する
            const { spreadsheetId } = await Spreadsheet.create();


            console.log('スプレッドシートに書き込みます');

            // const { spreadsheet_id } = (await query(`SELECT * FROM observe_tweets WHERE id = '${id}'`)).response.rows[0];

            const retweeters = (await query(`SELECT * FROM retweeters WHERE target_id = '${id}'`)).response.rows;

            await Spreadsheet.update(spreadsheet_id, retweeters, io);

            console.log('スプレッドシートに書き込みました');



        });

    */

    socket.on('add-blacklist', async(id) => {

        console.log('ブラックリストに追加します:', id);

        await DB.query(`INSERT INTO blacklist (id) VALUES ('${id}')`);

        // 成功
        socket.emit('add-blacklist', true);


    });


    socket.on('search-hashtag', async(hashtag) => {

        console.log('ハッシュタグで検索します', hashtag);

        const response = await Twitter.$search(`#${hashtag}`, {

            count: 100,

            result_type: 'recent',

            trim_user: false

        });

        io.emit('search-hashtag', response);

    });


    socket.on('add-target-tweet', (id) => {

        dbClient.query(`INSERT INTO observe_tweets (id) VALUES ('${id}')`, (err, res) => {

            updateObserveTweets();

            io.emit('log', { err, res });

        });

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
