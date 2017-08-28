const twitter = require('twitter');



const Decimal = require('decimal.js');


const client = new twitter({
    consumer_key: 'KBARD1nq3jV1rrxPg9eHAvavo',
    consumer_secret: 'HeCtqZag01SZmbbbIV7WWX0glX44RqGCtBa28qMMnSWecKarIL',
    access_token_key: '294436176-0esY5xOKLsmaGolQ1F6P5G2nGpdgrlzsvmnXteHC',
    access_token_secret: 'KlpgzZcHsx9ciOu9fDxCuBrUqmE3LtlVJ0ML6E8rnkxj9'
});

// 公式クライアントのコンシューマーキー
const $client = new twitter({
    consumer_key: '3nVuSoBZnx6U4vzUxf5w',
    consumer_secret: 'Bcs59EFbbsdF6Sl9Ng71smgStWEGwXXKSjYvPVt7qys',
    access_token_key: '884695172155449346-7Rts5PXbMuwOjpA3FOVjM53bOAE0bj4',
    access_token_secret: 'N2QPHySC86xzUC81mIIT70pg0Vsh9GLPXe5dMCpRUEkRW'
});


/**
 * クエリをオブジェクトに変換する
 * @param  {String} query クエリ
 * @return {Object}       オブジェクト
 */
function parseQuery(query) {

    // クエリがない
    if (!query) return null;

    query
        .replace(/^\?/, '')
        .split('&')
        .map((text) => text.split('='))
        .reduce((obj, [key, value]) => {
            obj[key] = decodeURIComponent(value);
            return obj;
        }, {});
}


module.exports = class Twitter {


    static get(api, params, $ = false) {

        return new Promise((resolve, reject) => {
            ($ ? $client : client).get(api, params, (e, t, r) => {
                if (e) {
                    console.error(e);
                    reject(e);
                }
                resolve(t);
            });
        });

    }


    /**
     * ツイートを検索する
     * @param  {[type]}  query  [description]
     * @param  {[type]}  params [description]
     * @return {Promise}        [description]
     */
    static async $search(query, params) {

        const results = [];


        let $maxId = Decimal(Infinity);
        let $maxIdOld = Decimal(0);


        // ツイートだけを取得
        params.modules = 'status';



        while (true) {

            console.log('ツイートを検索します', params.max_id);

            params.q = query;

            // max_id をクエリに追加する
            if (params.max_id) {
                params.q += ` max_id:${params.max_id}`;
            }

            const result = await Twitter.get('search/universal', params, true);

            console.log(result.modules.length);

            const { metadata, modules } = result;




            results.push(...modules);

            // maxId を求める

            // let $minId =

            modules.forEach((module) => {


                console.log('max_id: ', module.status.data.id_str);

                // $maxId = Decimal(module.status.data.id_str);
                $maxId = Decimal.min($maxId, Decimal(module.status.data.id_str));

            });


            params.max_id = $maxId.minus(1).d.join('');


            if ($maxId.equals($maxIdOld)) break;

            $maxIdOld = $maxId;


            await new Promise((resolve) => setTimeout(resolve, 300));

        }

        return results;


        let testObj = {};

        results.forEach((r) => {
            const id = r.status.data.user.screen_name;
            testObj[id] = r.status.data.user;
        });

        const result2 = [];

        // results.clear();// = [];

        for (const [key, value] of Object.entries(testObj)) {

            result2.push({
                status: {
                    data: {
                        user: value
                    }
                }
            });

        }




        return result2;

    }


    static async search(query, params) {

        return console.error('Twitter.search');

    }




}
