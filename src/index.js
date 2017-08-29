// WebSocket
const socket = io(location.href.replace('http', 'ws'), {
    transports: ['websocket']
});

window.socket = socket;


// utils
import {
    choice,
    zeroPad,
    shuffle,
    getRandomInt,
    formatTime16
} from './utils';


import { Line } from 'vue-chartjs';



console.log(Line);
Line.extend({
    props: ['data', 'options'],
    mounted() {

        this.renderChart(this.data, this.options);


    }
});



let app = null;


import Vue from './lib/vue';



const TW_ID = '600720083413962752';




import User from './user';
import Tweet from './tweet';


// vuejs のコンポーネントを登録する
import createVueComponents from './vue-components';
createVueComponents(Vue);



/**
 * 抽選の対象になるリツイーター一覧を取得する
 * @param  {[type]} id ツイート ID
 * @return {[type]}    [description]
 */
function getLotteryTargetRetweeters(id) {

    const tweet = getTweet(id);

    let retweeters = [...tweet.retweeters];

    const {
        ffRatioCheck,
        ffRatioBorder,
        followerCountCheck,
        followerCountBorder
    } = tweet.view;


    // フォロー or フォロワー がいないアカウントを除外
    retweeters = retweeters.filter((retweeter) => {
        return retweeter.followCount > 0 && retweeter.followerCount > 0;
    });


    // FF 比をチェックする
    if (ffRatioCheck && ffRatioBorder !== null) {

        const border = parseFloat(ffRatioBorder);

        console.log('FF 比許容範囲: ' + border);

        retweeters = retweeters.filter((retweeter) => {

            const ratio = retweeter.ffRatio; //followers_count / retweeter.friends_count;
            return (ratio >= border);

        });

    }

    // フォロワー数をチェックする
    if (followerCountCheck && followerCountBorder !== null) {
        const border = parseFloat(followerCountBorder);
        console.log('必須フォロワー数: ' + border);
        retweeters = retweeters.filter((retweeter) => {
            return (retweeter.followerCount >= border);
        });
    }

    return retweeters;

}



/**
 * WebSocket でリクエストを送り結果を受け取る
 * @param  {[type]} name WebSocket のイベント名
 * @param  {[type]} args 引数
 */
function request(name, ...args) {

    // 既に登録されていたリスナーを削除する
    socket.off(name);

    return new Promise((resolve) => {

        // 結果を受け取ったら resolve
        socket.on(name, (...args) => {

            resolve(...args);

        });

        socket.emit(name, ...args);

    });
}



// リツイーターから 1 ユーザーを抽選する
function lottery(retweeters) {
    return choice(retweeters);
}





/**
 * 抽選結果を反映する
 * @param {[type]} users 当選者一覧
 */
async function setLotteryResult(users) {

    $('#lottery-dialog').modal();

    app.$data.lottery.users = users;

    await Vue.nextTick();

    // ユーザー TL を生成
    for (const user of users) {

        const el = document.querySelector(`#lu${user.id}`);
        el.innerHTML = '';

        try {

            twttr.widgets.createTimeline(TW_ID, el, {
                screenName: user.screenName
            });

        } catch (e) {
            // 既にダイアログが閉じられている
        }

    }

}


async function $lottery({ target }, n, isMixed = false) {

    // 対象のツイート ID
    const id = target.getAttribute('tweet-id');

    // 抽選対象
    let retweeters;
    // 全ての対象ツイートのリツイーターからランダムで選ぶ
    if (isMixed) {
        retweeters = [];
        for (const tweet of app.$data.tweets) {
            retweeters.push(...tweet.retweeters);
        }
        //
        console.log('全てのリツイーターから抽選します: ', retweeters);

    } else {

        retweeters = getLotteryTargetRetweeters(id);

    }


    console.log('抽選対象数: ', retweeters.length);

    app.$data.lottery.users = [];

    // 抽選回数 > 抽選対象者数 ならそのまま当選したことにする
    if (n > retweeters.length) {

        const users = retweeters;

        /*.map((retweeter) => {
            return User.from(retweeter);
        });
        */

        // 対象者たちをそのまま当選させる
        setLotteryResult(users);

        return;
    }


    const users = [];


    // n 回抽選する
    for (let i = n; i--;) {

        // 当選者
        const retweeter = lottery(retweeters);

        // 対象者一覧から除外
        retweeters = retweeters.filter(({ id }) => id !== retweeter.id);

        const user = retweeter; //User.from(retweeter);

        users.push(user);

        console.log('抽選結果: ', user);

    }


    // 抽選結果を反映
    setLotteryResult(users);

}


app = new Vue({
    el: '#app',
    data: {

        tweets: [],

        modals: {

            spreadsheet: {
                done: false,
                targetTweetId: null
            }

        },

        // 抽選
        lottery: {

            users: [],


            name: '',
            screen_name: ''
        },


        ff: {
            checkedCount: 0
        },

        databaseCapacity: {
            max: 0,
            count: 0
        },

        // 検索
        search: {

            isLoading: false,

            // 検索に使用するハッシュタグ
            // hashtag: '勝つのは3番',
            hashtag: 'セキテイリュウオー',
            // 検索結果
            results: []
        },


        blacklist: {
            id: null,
            users: []
        },


        inputTime: '',
        time: null,

    },


    computed: {
        reversedTweets() {
            return [...this.tweets].reverse();
        }
    },


    methods: {


        /**
         * 検索結果を監視ツイートの形式に変換する
         * @return {[type]} [description]
         */
        searchResultToTweet() {



            const tweet = Tweet.from({
                id: '#' + app.$data.search.hashtag,
                oembed: null

            });

            tweet.retweeters = [];





            for (const u of app.$data.search.results) {

                tweet.retweeters.push(User.from(u.status.data.user));

            }

            app.$data.tweets.push(tweet);


        },

        addBlacklist() {

            const id = app.$data.blacklist.id;

            socket.emit('add-blacklist', id);

        },

        async searchHashtag() {

            app.$data.search.isLoading = true;

            const hashtag = app.$data.search.hashtag;

            if (!hashtag) {
                return console.warn('ハッシュタグが入力されていません');
            }

            // 以前の検索結果を削除する
            app.$data.search.results = [];


            console.log('ハッシュタグで検索します', hashtag);

            const results = await request('search-hashtag', hashtag);

            app.$data.search.results = results;

            app.$data.search.isLoading = false;

        },

        toggleOptions() {
            // this.view
        },

        // スプレッドシートに書き込む
        writeSpreadsheet({ target }) {

            const id = target.getAttribute('tweet-id');

            app.$data.modals.spreadsheet.targetTweetId = id;

            console.log('スプレッドシートを開きます', id);

            socket.emit('spreadsheet', id);
        },

        /**
         * スプレッドシートを開く
         */
        openSpreadsheet() {

            const tweetId = app.$data.modals.spreadsheet.targetTweetId;

            const id = getTweet(tweetId).spreadsheetId;

            console.log(getTweet(tweetId));

            window.open(`https://docs.google.com/spreadsheets/d/${id}`);

        },

        /**
         * 複数のツイートを対象に抽選する
         */
        mixLottery() {
            $lottery({
                target: {
                    getAttribute() {

                    }
                }
            }, 5, true);
        },

        openLotteryDialog10(e) {
            $lottery(e, 10);
        },

        openLotteryDialog(e) {
            $lottery(e, 1);
        },

    },


    filters: {
        reverse(array) {
            return [...array].reverse();
        }
    },

    watch: {

        inputTime(value) {

            const time = zeroPad(value, 14);

            const date = new Date(formatTime16(time));

            this.time = date.toLocaleString();

        }
    }


});



Vue.app = app;




socket.on('database-capacity', (databaseCapacity) => {
    app.$data.databaseCapacity = databaseCapacity;
});



socket.on('restart', () => {

    alert('restart');


    location.reload();
});




socket.on('log', function(msg) {

    //console.info(msg);

});

socket.on('error', (...args) => {

    console.error(...args);
});

let _spreadsheet_id = null;


// FF 情報を受け取る
socket.on('ff-checked', (count) => {
    app.$data.ff.checkedCount = count;
});


socket.on('spreadsheet', async(ss) => {
    console.log('spreadsheet の情報を取得しました', ss);

    await waitTweetLoaded(ss.id);

    console.log('spreadsheet の情報を反映します', ss.spreadsheet_id);

    // スプレッドシートの情報を入れる
    getTweet(ss.id).spreadsheetId = ss.spreadsheet_id;

});



// 監視対象ツイートを受け取る
socket.on('observe-tweets', async(tweets) => {


    for (const tweet of tweets) {

        app.$data.tweets.push(Tweet.from(tweet));

    }


    // ビューに反映されるまで待機
    await Vue.nextTick();
    // twitter 埋め込みを生成する
    updateOembeds();

    console.log('Tweets', tweets);


});



$('#open-spreadsheet').on('shown.bs.modal', () => {
    $('#myInput').focus()
});




function updateOembeds() {
    for (const el of document.querySelectorAll('.twitter-tweet')) {
        twttr.widgets.load(el);
    }
}


socket.on('spreadsheet-end', () => {
    app.$data.modals.spreadsheet.done = true;
});


function getTweet(id) {
    return app.$data.tweets.filter((tweet) => tweet.id === id)[0];
}


/**
 * ツイートが読み込まれるまで待機する
 * @param  {String}  id             ツイート ID
 * @param  {Number}  [interval=100] [description]
 * @return {Promise}                [description]
 */
function waitTweetLoaded(id, interval = 100) {
    console.warn(id);
    return new Promise((resolve) => {
        const clear = setInterval(() => {
            // ツイート情報が取得できたら resolve
            console.warn('resolve', id);

            if (getTweet(id)) resolve();
            clearInterval(clear);
        }, interval);
    });
}


socket.on('retweeters', async({ id, retweeters }) => {

    await waitTweetLoaded(id);

    const tweet = getTweet(id);

    tweet.retweeters = retweeters.map((retweeter) => {
        return User.from(retweeter);
    });


});


// ブラックリストを受け取る
socket.on('blacklist', (users) => {
    app.$data.blacklist.users = [...users, ...users, ...users];
});



/*
document.querySelector('#add').addEventListener('click', function() {
    const id = document.querySelector('#id').value;
    console.log('add: ', id);
    socket.emit('add-target-tweet', id);
    location.reload();
});
document.querySelector('#TEST').addEventListener('click', () => {
    socket.emit('TEST');
});
*/



socket.on('error', function(msg) {
    console.error(msg);
});
