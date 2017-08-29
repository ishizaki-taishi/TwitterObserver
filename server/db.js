// const squel = require('squel');


// TODO: 設定ファイルを作る
const databaseURL = 'postgres://zsmdfzjfczrdyi:16cdebdfc49073acbdb90c47a098d14bdd4a6bf5d6ee3ca31e0ee5c3c49e4804@ec2-54-221-221-153.compute-1.amazonaws.com:5432/d4k46sqvuojehi';


const { Pool, Client } = require('pg');


const connectionString = process.env.DATABASE_URL || databaseURL;

const pool = new Pool({
    connectionString,
    ssl: true
});

const client = new Client({
    connectionString,
    ssl: true
});

client.connect();

console.log('DB に接続しました', connectionString);

module.exports = class DB {

    static get $client() {
        return client;
    }

    static query(query) {
        return DB.$dbQuery(query);
    }

    static $query(query) {
        return new Promise((resolve) => {
            client.query(query, (e, res) => {
                resolve({
                    error: e,
                    response: res
                });
            });
        });
    }

    static $dbQuery(query) {
        return new Promise((resolve) => {
            client.query(query, (error, response) => {
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

};
