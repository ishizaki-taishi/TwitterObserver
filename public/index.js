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




Vue.component('app-icon', {
    props: ['fa'],
    template: '#icon-template'
});


Vue.component('app-container', {
    template: '#container-template'
});


const app = new Vue({
    el: '#app',
    data: {

        message: '',

        observeTweets: [],

        lottery: {
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

        retweeters: []

    },
    methods: {

        openSpreadsheet() {
            console.log('スプレッドシートを開きます');
            socket.emit('spreadsheet');
        },


        openLotteryDialog() {

            app.$data.lotteryOembed = 'loading...';

            const length = app.$data.retweeters.length;

            const retweeter = shuffle([...app.$data.retweeters])[getRandomInt(0, length)];

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

            // document.querySelector('#ottery-oembed').innerHTML = '';

            socket.emit('lottery-oembed', retweeter.screen_name);


            // $('#lottery-dialog').focus();
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



socket.on('lottery-oembed', (oembed) => {
    console.log('抽選結果の oembed を受け取りました: ', oembed);
    app.$data.lotteryOembed = oembed;

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
