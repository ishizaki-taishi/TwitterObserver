const path = require('path');

module.exports = {

    context: path.resolve(__dirname, 'src'),

    entry: {
        app: './index.js'
    },

    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js'
    },

    module: {
        loaders: [{
            test: /\.js$/,
            exclude: /node_modules/,
            loader: "babel-loader"
        }]
    },
    target: 'web'
};
