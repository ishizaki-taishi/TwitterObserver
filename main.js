const port = process.env.PORT || 3000;

const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

io.listen(http);


const MAX_REQUEST_COUNT = 300;



const interval = Math.floor(60 * 15 / (MAX_REQUEST_COUNT * 0.5) * 1000);

const RequestInterval = {
    StatusesRetweetersIds: 30000
};

const path = require('path');

const databaseURL = 'postgres://zsmdfzjfczrdyi:16cdebdfc49073acbdb90c47a098d14bdd4a6bf5d6ee3ca31e0ee5c3c49e4804@ec2-54-221-221-153.compute-1.amazonaws.com:5432/d4k46sqvuojehi';



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







let observeTweets = [];


function updateObserveTweets() {


    // 監視するツイート一覧を取得する
    dbClient.query('SELECT * FROM observe_tweets', (err, result) => {

        observeTweets = result.rows.map((row) => row.id);

        console.log(observeTweets);

    });

}



updateObserveTweets();




async function getRT() {

    //    return;

    io.emit('log', 'DB Connection' + connectionString);

    io.emit('observe-tweets', observeTweets);


    try {


        for (const id of observeTweets) {

            io.emit('log', id);

            const targetID = id;

            // RT 情報を取得する
            // const response = await get('statuses/retweeters/ids', { id, stringify_ids: true });
            const response = await get('statuses/retweets/' + id, { id, count: 100, trim_user: false });

            const users = response.map((status) => status.user);



            users.forEach((user) => {

                const { id } = user;

                dbClient.query(`INSERT INTO retweeters (id, target_id) VALUES (${id}, ${targetID})`, (err, res) => {

                    io.emit('log', { err, res });

                });

            });

            io.emit('log', users);



        }
    } catch (e) {
        console.error(e);
        io.emit('error', e);
    }

}


// setInterval(getRT, RequestInterval.StatusesRetweetersIds);




console.log(setInterval);
console.log(RequestInterval.StatusesRetweetersIds);

io.sockets.on('connection', (socket) => {


    // beta
    getRT();

    io.emit('log', `API Interval: ${interval}`);


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






    socket.on('ss', (id) => {

        let params = {
            id
        };




        params.stringify_ids = true;

        client.get('statuses/retweeters/ids', params, async(e, t, r) => {
            try {

                if (e) return console.error(e);


                for (const id of t.ids.slice(0, 5)) {


                    const t = await get('users/show', { id });

                    const { name, screen_name } = t;

                    io.emit('log', `${name} @${screen_name}`);

                }




                io.emit('log', { e, t, r });

            } catch (e) {
                io.emit('error', e);
            }
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
