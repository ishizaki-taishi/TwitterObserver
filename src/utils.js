export const QueryString = {
    parse(text, sep, eq, isDecode = true) {
        text = text || location.search.substr(1);
        if (isDecode) text = decodeURIComponent(text);
        sep = sep || '&';
        eq = eq || '=';
        return text.split(sep).reduce((obj, v) => {
            var pair = v.split(eq);
            obj[pair[0]] = pair[1]; //decode(pair[1]);
            return obj;
        }, {});
    },
    stringify(value, sep, eq, isEncode) {
        sep = sep || '&';
        eq = eq || '=';
        var encode = (isEncode) ? encodeURIComponent : function(a) { return a; };
        return Object.keys(value).map(function(key) {
            return key + eq + encode(value[key]);
        }).join(sep);
    },
};



export function zeroPad(text, n) {
    return (('0').repeat(n) + text.substr(0, n)).substr(-n);
}

/**
 * 配列からランダムに要素を 1 つチョイスする
 * @param  {[type]} array [description]
 * @return {[type]}       [description]
 */
export function choice(array) {

    const length = array.length;

    const result = shuffle([...array])[getRandomInt(0, length)];

    if (!result) {
        console.error('choice error');
    }

    return result;
}


export function shuffle(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var r = Math.floor(Math.random() * (i + 1));
        var tmp = array[i];
        array[i] = array[r];
        array[r] = tmp;
    }
    return array;
}

export function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

export function formatTime16(text) {
    const format = '0123-45-67T89:ab:cd';
    return format.split('').map((value) => {
        if (!value.match(/[0-9a-d]/)) return value;
        return text[parseInt(value, 16)];
    }).join('');
}
