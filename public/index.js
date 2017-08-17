const socket = io(location.href.replace('http', 'ws'), {
    transports: ['websocket']
});

const TW_ID = '600720083413962752';

window.socket = socket;

function shuffle(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var r = Math.floor(Math.random() * (i + 1));
        var tmp = array[i];
        array[i] = array[r];
        array[r] = tmp;
    }
    return array;
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

function formatTime16(text) {
    const format = '0123-45-67T89:ab:cd';
    return format.split('').map((value) => {
        if (!value.match(/[0-9a-d]/)) return value;
        return text[parseInt(value, 16)];
    }).join('');
}



class User {
    constructor() {

        this.name = '';
        this.screenName = '';

        this.followCount = 0;
        this.followerCount = 0;

    }

    static from(data) {

        const user = new User();

        user.id = data.id;
        user.name = data.name;
        user.screenName = data.screen_name;
        user.followCount = data.friends_count;
        user.followerCount = data.followers_count;
        user.ffRatio = (user.followerCount / user.followCount).toFixed(2);

        return user;

    }

}


class Tweet {

    constructor() {

        this.id = Math.random();
        this.retweeters = [];

    }

    static from(data) {

        const tweet = new Tweet();

        tweet.id = data.id;
        tweet.spreadsheetId = null; // data.spreadsheet_id;
        tweet.oembed = data.oembed;

        return tweet;

    }

}

class ObserveTweet extends Tweet {

}




Vue.component('app-icon', {
    props: ['fa'],
    template: '#icon-template'
});


Vue.component('app-container', {
    template: '#container-template'
});


function lottery(id) {


    const tweet = getTweet(id);

    let retweeters = [...tweet.retweeters];

    const ffCheckEl = document.querySelector('#ff-check');
    const ffRatioBoaderEl = document.querySelector('#ff-check-ratio-boader');

    const aRtCnt = retweeters.length;

    if (ffCheckEl.checked) {

        const boader = parseFloat(ffRatioBoaderEl.value);

        console.log('FF 比許容範囲: ' + boader);

        retweeters = retweeters.filter((retweeter) => {


            if (retweeter.followers_count <= 999) return false;

            //
            if (
                retweeter.friends_count <= 0 ||
                retweeter.followers_count <= 0
            ) {
                return false;
            }
            //
            const ratio = retweeter.followers_count / retweeter.friends_count;

            return (ratio >= boader);

        });

    }


    const bRtCnt = retweeters.length;

    if (ffCheckEl.checked) {
        console.log('リツイーターにフィルタをかけました: ' + bRtCnt + '/' + aRtCnt);
    }

    const length = retweeters.length;

    const retweeter = shuffle([...retweeters])[getRandomInt(0, length)];

    if (!retweeter) return lottery();

    return retweeter;
}


let lotteryResolver = null;

const lotteryUserResolvers = {};


async function $lottery({ target }, n) {

    const id = target.getAttribute('tweet-id');

    app.$data.lottery.users = [];

    const users = [];



    $('#lottery-dialog').modal();


    // n 回抽選する
    for (let i = n; i--;) {

        // 当選者
        const retweeter = lottery(id);
        const user = User.from(retweeter);

        users.push(user);


        console.log('抽選結果: ', user);



    }


    app.$data.lottery.users = users;

    await Vue.nextTick();


    // ユーザー TL を生成
    for (const user of users) {

        const el = document.querySelector(`#lu${user.id}`);
        el.innerHTML = '';

        twttr.widgets.createTimeline(TW_ID, el, {
            screenName: user.screenName
        });

    }




}


const app = new Vue({
    el: '#app',
    data: {

        message: '',

        tweets: [],

        observeTweets: [],

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

        lotteryOembed: '',

        databaseCapacity: {
            max: 0,
            count: 0
        },

        inputTime: '',
        time: null,

    },
    methods: {

        // スプレッドシートに書き込む
        writeSpreadsheet({ target }) {

            const id = target.getAttribute('tweet-id');

            app.$data.modals.spreadsheet.targetTweetId = id;

            console.log('スプレッドシートを開きます', id);

            socket.emit('spreadsheet', id);
        },

        openSpreadsheet() {

            const tweetId = app.$data.modals.spreadsheet.targetTweetId;

            const id = getTweet(tweetId).spreadsheetId;

            window.open(`https://docs.google.com/spreadsheets/d/${id}`);

        },

        async openLotteryDialog10(e) {

            $lottery(e, 10);

            return;

            const lotteryUsers = [];

            app.$data.lotteryOembed = 'loading...';


            app.$data.lotteryUsers = [];


            const userEl = document.querySelector('#lottery-user');
            userEl.innerHTML = '';


            $('#lottery-dialog').modal();

            for (let i = 0; i < 10; ++i) {

                /*
                const oembed = await new Promise((resolve) => {
                    lotteryResolver = resolve;
                */

                const retweeter = lottery();

                const lotteryUser = retweeter;

                lotteryUser.ff = (retweeter.followers_count / retweeter.friends_count).toFixed(2);


                lotteryUser.id = 'LU_' + Math.random().toString().replace('.', '');

                socket.emit('lottery-oembed', retweeter.screen_name);


                lotteryUsers.push(lotteryUser);
                /*
                });
                */

                app.$data.lotteryUsers = lotteryUsers;


                await Vue.nextTick();

                //await new Promise((resolve) => setTimeout(resolve, 1000));

                const el_id = lotteryUsers[lotteryUsers.length - 1].id;

                console.log('ID: ', el_id);

                twttr.widgets.createTimeline(
                    '600720083413962752',
                    document.querySelector('#' + el_id), {
                        screenName: lotteryUsers[lotteryUsers.length - 1].screen_name
                    }
                );


                //    lotteryUsers[lotteryUsers.length - 1].oembed = oembed;

            }





        },


        openLotteryDialog(e) {

            $lottery(e, 1);

        },

        test() {

        }
    },
    watch: {
        // この関数は question が変わるごとに実行されます。
        inputTime(value) {

            const time = ('00000000000000' + value.substr(0, 14)).substr(-14);

            const date = new Date(formatTime16(time));

            this.time = date.toLocaleString();

        }
    }


});




socket.on('lottery-oembed', (oembed) => {
    console.log('抽選結果の oembed を受け取りました: ', oembed);
    app.$data.lotteryOembed = oembed;


    if (lotteryResolver) {
        lotteryResolver(oembed);
        lotteryResolver = null;
    }

    setTimeout(() => {

        [...document.querySelectorAll('.twitter-tweet')].forEach((el) => {
            twttr.widgets.load(el);
        });

    }, 500);
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

socket.on('spreadsheet', (ss) => {
    getTweet(ss.id).spreadsheetId = ss.spreadsheet_id;
});




socket.on('observe-tweets', async(tweets) => {


    for (const tweet of tweets) {

        app.$data.tweets.push(Tweet.from(tweet));

    }


    await Vue.nextTick();

    updateOembeds();

    console.log('Tweets', tweets);

    app.$data.observeTweets = tweets;

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


socket.on('retweeters', ({ id, retweeters }) => {

    const tweet = getTweet(id);

    tweet.retweeters = retweeters;

});


document.querySelector('#add').addEventListener('click', function() {
    const id = document.querySelector('#id').value;

    console.log('add: ', id);

    socket.emit('add-target-tweet', id);

    location.reload();
});



document.querySelector('#TEST').addEventListener('click', () => {

    socket.emit('TEST');

});



socket.on('error', function(msg) {
    console.error(msg);
});
