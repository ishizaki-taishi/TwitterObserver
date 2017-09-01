const path = require('path');
const webpack = require('webpack');


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
        loaders: [


            {
                test: /\.vue$/,
                // include: /components/,
                loader: 'vue-loader',

                options: {
                    loaders: {
                        js: 'babel-loader'
                    }
                }
            },

            {
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
            /*
            {
                test: /\.vue$/,
                loader: 'vue'
            }
            */
        ]
    },


    resolve: {
        alias: {
            'vue$': 'vue/dist/vue.common.js',

            // 'vue$': 'vue/dist/vue.common.js'
            // 'vue$': 'src/lib/vue.js'
        }
    },


    target: 'web'

};
