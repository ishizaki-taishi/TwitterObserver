const path = require('path');
const webpack = require('webpack');

console.log('WEBPACK');

module.exports = {

    context: path.resolve(__dirname, 'src'),

    entry: {
        app: [
            'babel-polyfill',
            './index.js'
        ]
    },

    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js'
    },

    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            include: /src/
        })
    ],

    module: {
        loaders: [{
                test: /\.js$/,
                include: [
                    /src/,
                ],
                exclude: [
                    /node_modules/,
                    /lib/
                ],
                loader: 'babel-loader'
            },
            {
                test: /\.vue$/,
                loader: 'vue'
            }
        ]
    },


    target: 'web'

};
