const Twitter = require('twitter');

const client = new Twitter({
    consumer_key: 'KBARD1nq3jV1rrxPg9eHAvavo',
    consumer_secret: 'HeCtqZag01SZmbbbIV7WWX0glX44RqGCtBa28qMMnSWecKarIL',
    access_token_key: '294436176-0esY5xOKLsmaGolQ1F6P5G2nGpdgrlzsvmnXteHC',
    access_token_secret: 'KlpgzZcHsx9ciOu9fDxCuBrUqmE3LtlVJ0ML6E8rnkxj9'
});



const params = { screen_name: 'nodejs' };

client.get('statuses/user_timeline', params, function(error, tweets, response) {

    console.log(arguments)

    if (!error) {
        console.log(tweets);
    }
});
