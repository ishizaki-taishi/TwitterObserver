const socket = io(location.href.replace('http', 'ws'), {
    transports: ['websocket']
});

window.socket = socket;





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

        observeTweets: [],

        databaseCapacity: {
            max: 0,
            count: 0
        },

        retweeters: []

    },
    methods: {
        test() {

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


const left = document.querySelector('#left');


socket.on('log', function(msg) {

    //console.info(msg);

});

socket.on('error', (...args) => {

    console.error(...args);
});

let _spreadsheet_id = null;


socket.on('spreadsheet', (ss) => {
    _spreadsheet_id = ss.spreadsheet_id;
});

socket.on('observe-tweets', (tweets) => {

    app.$data.observeTweets = tweets;

    return;

    for (const {
            id,
            oembed
        } of tweets) {

        const div = document.createElement('div');
        div.innerHTML =
            `


<div><h2>${id}</h2>




<button id="open-spreadsheet" role="button" data-backdrop="static" data-toggle="modal" data-target="#myModal" class="btn btn-outline-success" type="submit">Spreadsheet</button>


<input disabled type="button" role='button' class="btn btn-outline-danger remove-observe-tweet" value="Delete" data-id="${id}"

    onclick="socket.emit('remove-target-tweet', ${id})"

/>


</div>

${oembed}

`;

        twttr.widgets.load(div);

        left.appendChild(div);



        document.querySelector('#open-spreadsheet').addEventListener('click', () => {
            socket.emit('spreadsheet');
        });
    }

    // console.info('OTIDS' + ids);

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
