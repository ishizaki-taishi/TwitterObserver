
const QueryString = {
    parse: function(text, sep, eq, isDecode = true) {
        text = text || location.search.substr(1);
        if (isDecode) text = decodeURIComponent(text);
        sep = sep || '&';
        eq = eq || '=';
        return text.split(sep).reduce(function(obj, v) {
            var pair = v.split(eq);
            obj[pair[0]] = pair[1]; //decode(pair[1]);
            return obj;
        }, {});
    },
    stringify: function(value, sep, eq, isEncode) {
        sep = sep || '&';
        eq = eq || '=';
        var encode = (isEncode) ? encodeURIComponent : function(a) { return a; };
        return Object.keys(value).map(function(key) {
            return key + eq + encode(value[key]);
        }).join(sep);
    },
};




module.exports = {

QueryString

};
