const socket = io(location.href.replace('http', 'ws'), {
    transports: ['websocket']
});


let app = null;


import Vue from './lib/vue';



const TW_ID = '600720083413962752';

window.socket = socket;

import {

    choice,
    zeroPad,
    shuffle,
    getRandomInt,
    formatTime16
} from './utils';


import User from './user';
import Tweet from './tweet';


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



// リツイーターから 1 ユーザーを抽選する
function lottery(retweeters) {

    return choice(retweeters);

}


let lotteryResolver = null;
const lotteryUserResolvers = {};


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

        inputTime: '',
        time: null,

    },
    methods: {

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


    watch: {

        inputTime(value) {

            const time = zeroPad(value, 14);

            const date = new Date(formatTime16(time));

            this.time = date.toLocaleString();

        }
    }


});






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


socket.on('ff-checked', (count) => {
    app.$data.ff.checkedCount = count;
});

socket.on('spreadsheet', async(ss) => {


    await waitTweetLoaded();

    // スプレッドシートの情報を入れる
    getTweet(ss.id).spreadsheetId = ss.spreadsheet_id;

});




socket.on('observe-tweets', async(tweets) => {


    for (const tweet of tweets) {

        app.$data.tweets.push(Tweet.from(tweet));

    }


    await Vue.nextTick();

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
    console.warn(this);
    return new Promise((resolve) => {
        const clear = setInterval(() => {
            // ツイート情報が取得できたら resolve
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
