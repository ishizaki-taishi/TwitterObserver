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

    /*
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            include: /src/
        })
    ],

    devtool: 'cheap-module-eval-source-map',

    */

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
                    path.resolve(__dirname, 'src'),
                    path.resolve(__dirname, 'node_modules/bootstrap-vue')
                ],
                loader: 'babel-loader'
            },


            // StyleLoader
            {
                test: /\.css$/,
                loader: 'style-loader!css-loader'
            },

            {
                test: /\.(png|jpg)$/,
                loader: 'url-loader?limit=8192'
            },

            {
                test: /\.(ttf|eot|svg|woff(2)?)(\?[a-z0-9=&.]+)?$/,
                loader: 'file-loader'
            }

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

        }
    },


    target: 'web'

};
