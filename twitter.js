const twitter = require('twitter');

const client = new twitter({
    consumer_key: 'KBARD1nq3jV1rrxPg9eHAvavo',
    consumer_secret: 'HeCtqZag01SZmbbbIV7WWX0glX44RqGCtBa28qMMnSWecKarIL',
    access_token_key: '294436176-0esY5xOKLsmaGolQ1F6P5G2nGpdgrlzsvmnXteHC',
    access_token_secret: 'KlpgzZcHsx9ciOu9fDxCuBrUqmE3LtlVJ0ML6E8rnkxj9'
});

module.exports = class Twitter {


    static get(api, params) {

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




}
