const socket = io(location.href.replace('http', 'ws'), {
    transports: ['websocket']
});

window.socket = socket;




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

        ff: {
            checkedCount: 0
        },

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

    /*
            twttr.widgets.load(div);

            left.appendChild(div);



            console.log(document.querySelector('#open-spreadsheet'));



    document.querySelector('#open-spreadsheet').addEventListener('click', () => {
        console.log('emit: spreadsheet');
        socket.emit('spreadsheet');
    });



// console.info('OTIDS' + ids);

    */
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
