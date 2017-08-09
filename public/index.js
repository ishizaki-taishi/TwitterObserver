const socket = io(location.href.replace('http', 'ws'), {
    transports: ['websocket']
});

//window.socket = socket;


const left = document.querySelector('#left');

/*
const errorImpl = console.error;
console.error = function error(message) {
  errorImpl.apply(this, arguments);
  if (message.startsWith('WebSocket')) {
    console.error('__ WebSocket Removed');
  }
};
*/

socket.on('log', function(msg) {

    //console.info(msg);

});

socket.on('error', (...args) => {

    console.error(...args);
});

socket.on('spreadsheet', (ss) => {

    const div = document.createElement('div');


    div.innerHTML = `

    <!--<iframe width="100%" height="600" src="https://docs.google.com/spreadsheets/d/${ss.spreadsheet_id}" frameborder="0"></iframe>-->


    `;

    document.body.appendChild(div);


});

socket.on('observe-tweets', (tweets) => {


    for (const {
            id,
            oembed
        } of tweets) {

        const div = document.createElement('div');
        div.innerHTML =
            `



<div><h2>${id}</h2>


<button id="add" class="btn btn-outline-success" type="submit">Spreadsheet</button>


<input type="button" class="btn btn-outline-danger remove-observe-tweet" value="Delete" data-id="${id}"

    onclick="socket.emit('remove-target-tweet', ${id})"

/>


</div>

${oembed}


<hr>

`;

        twttr.widgets.load(div);

        left.appendChild(div);

    }

    // console.info('OTIDS' + ids);

});




socket.on('retweeters', (retweeters) => {
    console.info(retweeters);
    const parent = document.querySelector('#log');
    for (const retweeter of retweeters) {

        // console.log(retweeter);

        const div = document.createElement('div');
        div.innerHTML = `

    <div class="user">
        ${JSON.stringify(retweeter)}
    </div>

    `;
        parent.appendChild(div);


    }

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
