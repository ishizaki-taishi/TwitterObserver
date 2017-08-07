const port = process.env.PORT || 3000;

const app = require('express')();
const http = require('http').Server(app);




const io = require('socket.io')(http);

io.listen(http);


const path = require('path');

const databaseURL = 'postgres://zsmdfzjfczrdyi:16cdebdfc49073acbdb90c47a098d14bdd4a6bf5d6ee3ca31e0ee5c3c49e4804@ec2-54-221-221-153.compute-1.amazonaws.com:5432/d4k46sqvuojehi';



const Twitter = require('twitter');

const client = new Twitter({
    consumer_key: 'KBARD1nq3jV1rrxPg9eHAvavo',
    consumer_secret: 'HeCtqZag01SZmbbbIV7WWX0glX44RqGCtBa28qMMnSWecKarIL',
    access_token_key: '294436176-0esY5xOKLsmaGolQ1F6P5G2nGpdgrlzsvmnXteHC',
    access_token_secret: 'KlpgzZcHsx9ciOu9fDxCuBrUqmE3LtlVJ0ML6E8rnkxj9'
});


io.sockets.on('connection', (socket) => {


    socket.on('ss', (id) => {

        let params = {
            id
        };


        /*


            */
        /*
                client.get('statuses/show', params, (error, tweets, response) => {

                    io.emit('log', { error, tweets, response });

                });

                */

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


    return;
    socket.on('msg', function(data) {
        io.sockets.emit('msg', data);
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






(() => {


    const { Pool, Client } = require('pg')
    const connectionString = process.env.DATABASE_URL || databaseURL; //'postgresql://dbuser:secretpassword@database.server.com:3211/mydb'

    io.emit('log', connectionString);

    const pool = new Pool({
        connectionString: connectionString,
        ssl: true
    });



    const client = new Client({
        connectionString: connectionString,
        ssl: true

    });

    client.connect()

    client.query('SELECT NOW()', (err, res) => {
        console.log(err, res);
        client.end();
    });

})();
