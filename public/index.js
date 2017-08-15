const socket = io(location.href.replace('http', 'ws'), {
    transports: ['websocket']
});

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

    }

}


class Tweet {

    constructor() {

        this.id = '';

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


function lottery() {

    let retweeters = [...app.$data.retweeters];

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


const app = new Vue({
    el: '#app',
    data: {

        message: '',

        tweets: [],

        observeTweets: [],

        lottery: {
            name: '',
            screen_name: ''
        },

        // n 連抽選の結果
        lotteryUsers: [

        ],

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

        retweeters: []

    },
    methods: {

        openSpreadsheet() {
            console.log('スプレッドシートを開きます');
            socket.emit('spreadsheet');
        },

        async openLotteryDialog10() {

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


            /*
            twttr.widgets.createTimeline(
                '600720083413962752',
                userEl, {
                    screenName: retweeter.screen_name
                }
            );
            */



        },

        openLotteryDialog() {

            app.$data.lotteryOembed = 'loading...';

            const retweeter = lottery();

            /*
            app.$data.lottery.name = retweeter.name;
            app.$data.lottery.screen_name = retweeter.screen_name;

            app.$data.lottery.friends_count = retweeter.friends_count;
            app.$data.lottery.followers_count = retweeter.followers_count;

            */
            app.$data.lottery = retweeter;
            app.$data.lottery.ff = (retweeter.followers_count / retweeter.friends_count).toFixed(2);


            console.log('抽選結果: ', retweeter);

            const userEl = document.querySelector('#lottery-user');
            userEl.innerHTML = '';

            twttr.widgets.createTimeline(
                '600720083413962752',
                userEl, {
                    screenName: retweeter.screen_name
                }
            );

            socket.emit('lottery-oembed', retweeter.screen_name);

            $('#lottery-dialog').modal();

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


app.$data.tweets.push(new Tweet());
app.$data.tweets.push(new Tweet());


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
    _spreadsheet_id = ss.spreadsheet_id;
});

socket.on('observe-tweets', (tweets) => {

    app.$data.observeTweets = tweets;

});



$('#open-spreadsheet').on('shown.bs.modal', () => {
    $('#myInput').focus()
});


document.querySelector('#spreadsheet-link').addEventListener('click', () => {


    window.open(`https://docs.google.com/spreadsheets/d/${_spreadsheet_id}`);

});


socket.on('spreadsheet-end', () => {
    document.querySelector('#spreadsheet-progress').textContent = '上書きに成功しました！';
    document.querySelector('#spreadsheet-link').disabled = '';
});



socket.on('retweeters', (retweeters) => app.$data.retweeters = retweeters);


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
