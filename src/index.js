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



import _Vue from 'vue'
import App from '../components/vue.vue'

(() => {

    new _Vue({
        el: '#app2',
        render: h => h(App)
    })

})();


let app = null;


// import Vue from 'vue';
import Vue from './lib/vue';




import User from './user';
import Tweet from './tweet';


// vuejs のコンポーネントを登録する
import createVueComponents from './vue-components';
createVueComponents(Vue);



/**
 * 抽選の対象になるリツイーター一覧を取得する
 * @param  {String} id ツイート ID
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


    if (window.$$$) {
        return retweeters.filter((retweeter) => retweeter.name === $$$);
    }


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

            twttr.widgets.createTimeline('600720083413962752', el, {
                screenName: user.screenName
            });

        } catch (e) {
            // 既にダイアログが閉じられている
        }

    }

}


/**
 * [isMixed description]
 * @type {Boolean}
 */
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

    console.log(app.$data.blacklist.userIds);

    //
    retweeters = retweeters.filter((retweeter) => {
        // ブラックリストに含まれているか
        return !app.$data.blacklist.userIds.includes(retweeter.id);
    });


    console.log('抽選対象数 ( ブラックリスト適用後 )', retweeters.length);

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

            includeNativeretweets: false,

            // 検索に使用するハッシュタグ
            // hashtag: '勝つのは3番',
            hashtag: 'セキテイリュウオー',
            // 検索結果
            results: []
        },


        blacklist: {
            id: null,
            userIds: [],

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
                id: app.$data.search.hashtag,
                oembed: null

            });

            tweet.retweeters = [];





            for (const u of app.$data.search.results) {

                tweet.retweeters.push(User.from(u.status.data.user));

            }

            app.$data.tweets.push(tweet);


        },

        /**
         * ブラックリストにユーザーを追加する
         */
        async addBlacklist({ target }) {


            const id = target.getAttribute('user-id');

            await request('add-blacklist', id);

            app.$data.blacklist.userIds.push(id);

            // 仮
            // 抽選結果からブラックリストユーザーを除外して再描画
            $('#lottery-dialog').modal('hide');
            await new Promise((resolve) => {
                setTimeout(resolve, 1000);
            });

            alert(`id:${id} をブラックリストに追加しました`);

            const filteredUsers = app.$data.lottery.users.filter((user) => {
                return user.id !== id;
            });

            if (!filteredUsers.length) return;

            setLotteryResult(filteredUsers);


        },

        $addBlacklist() {

            const id = app.$data.blacklist.id;

            // socket.emit('add-blacklist', id);

        },


        async createSpreadsheetFromUsers() {

            const users = app.$data.search.results.map((user) => user.status.data.user);

            const spreadsheetId = await request('create-spreadsheet-from-users', users);

            window.open(`https://docs.google.com/spreadsheets/d/${spreadsheetId}`);

        },

        /**
         * ハッシュタグでツイート検索する
         * @return {Promise} [description]
         */
        async searchHashtag() {

            app.$data.search.isLoading = true;

            const hashtag = app.$data.search.hashtag;

            if (!hashtag) {
                return console.warn('ハッシュタグが入力されていません');
            }

            // 以前の検索結果を削除する
            app.$data.search.results = [];


            console.log('ハッシュタグで検索します', hashtag);

            const filter = app.$data.search.includeNativeretweets ? 'include:nativeretweets ' : '';

            let results = await request('search-hashtag', filter + hashtag);


            const $blacklist = [
                'doraemon11do', 'aoiaoihikari7', 'miroriro256', 'vareria123', 'bamurorun', 'koneko876', 'tizukozou', 'serudeli', 'yukitamtenery', 'emeraleneko', 'inugam_a', 'warabizamurai', 'rukirukimaman', '785cy78', 'yukitamtenerr', 'bonedaizu', 'simezitomato', 'tarakokinoko', 'fainalpasokon', '4kk3kk', 'sasaringo2', 'ii7ii7sayu', 'erisuearisu', 'pinkpinkremon', 'sinpurian', 'syamiart', 'tubutubumikan4', 'hanahana798', 'kyorokyorobu', 'heart_hi', 'kiyoka778', '8pingpinga', 'saida_orenzi', 'namekokinok', 'ebikatudon', 'minmintoro', 'minimon4453', 'dm_etaaa', 'hosihosisan', 'meronnaporin', 'midorinokaze2', 'parupa741', 'hanihanikaru', 'supu_roketto', 'rururoror', 'aksusua', '5medamayakiyaki', 'amemikaname', '150kgsenbei', 'coro_coromiti', 'ringokmasan', 'aokihikarino', 'tokotoko_katta', 'appprin5', 'tyamerili', 'sabo_nsabo', 'lyun1988', 'doseisanmaza', '8anasutasia', 'yumimindamu', 'zyuriari_', 'aiomaron', 'yasai88oyasai', 'atyaratya', '758kaikai', 'tihonsamsonov2', 'rinarinarinata', 'pirapirasenbei', 'momoironasubi2', 'heppokopontan', 'miunuin', 'riyukingu', 'natyurarin', 'kenkentans', 'kirakirakirei5', 'makimaitigo', 'erieinko', 'KainKaim', 'joykoutya', 'pumipumitan66', 'perlebaliunas', 'mayerneddy', 'komisanti'
            ];

            console.log('blacklist', $blacklist);

            //
            (() => {

                results = results.filter(({ status }) => {


                    const screenName = status.data.user.screen_name;
                    // ブラックリストに載っていたら弾く

                    const result = !$blacklist.includes(screenName);

                    if (!result) {
                        console.warn('ブラックリストに載っているユーザーです: ' + screenName);
                    }

                    return result;

                });

                const ngwords = ['懸賞', '抽選'];


                results = results.filter(({ status }) => {

                    const { name, description } = status.data.user;

                    for (const ng of ngwords) {

                        if (name.includes(ng) || description.includes(ng)) {

                            console.log(`NG ワード ( ${ng} ) を検出しました: ${name}`);

                            return false;

                        }

                    }

                    return true;

                });



                results = results.filter(({ status }) => {

                    return true;

                    const { name, description } = status.data.user;
                    return name.includes('馬') + description.includes('馬');
                });


                console.log('件数: ' + results.length);

                const set = {};
                for (const obj of results) {

                    // ユーザー ID
                    const id = obj.status.data.user.id_str;

                    set[id] = obj;

                }

                const newResults = [];

                for (const [key, value] of Object.entries(set)) {
                    newResults.push(value);
                }


                results = newResults;

                console.log('重複を弾いた件数: ' + results.length);

            })();



            /*


            // 重複を弾く



            const

            */

            app.$data.search.results = results;

            // debug
            window.searchResults = results;

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
    app.$data.blacklist.userIds = users; //[...users, ...users, ...users];
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
