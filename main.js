const port = process.env.PORT || 3000;

const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

io.listen(http);


const MAX_REQUEST_COUNT = 300;



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


async function updateObserveTweets() {

    const { response } = await query('SELECT * FROM observe_tweets');

    observeTweets = response.rows.map((row) => row.id);

}



updateObserveTweets();




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

        const { name, screen_name } = await get('users/show', { user_id: userID });

        const r = await query(`UPDATE retweeters SET name = '${name}', screen_name = '${screen_name}', invalid = FALSE WHERE id = '${userID}'`);
        console.log('ユーザー名を取得しました', userID, r);
    }

    // ユーザーが存在しない
    catch (e) {

        const r = await query(`UPDATE retweeters SET invalid = TRUE WHERE id = '${userID}'`);
        console.log('ユーザー名の取得に失敗しました', userID, r);

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






    (async() => {

        const { response } = await query(`SELECT * FROM retweeters WHERE invalid IS NULL OR invalid = FALSE`);

        io.emit('retweeters', response.rows);

    })();


    socket.on('add-target-tweet', (id) => {

        dbClient.query(`INSERT INTO observe_tweets (id) VALUES (${id})`, (err, res) => {

            updateObserveTweets();

            io.emit('log', { err, res });

        });

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
    console.log('Example app listening on port 3000!');
});
