let webpack = require('webpack'); //to access built-in plugins
let htmlWebpackPlugin = require('html-webpack-plugin'); //installed via npm
let extractTextPlugin = require("extract-text-webpack-plugin");
let path = require('path');
let cleanWebpackPlugin = require('clean-webpack-plugin')

// the clean options to use
let cleanOptions = {
    root: __dirname,
    verbose: true,
    dry: false
}

// extract text options
let extractTextOptions = {
    filename: './css/[name].[chunkhash].css'
}

// the html options
let htmlOptions = {
    template: './src/index.html'
}

module.exports = {
    entry: {
        inboxsdk: './src/js/libs/inboxsdk.js',
        main: './src/js/app/index.ts'
    },
    output: {
        filename: './js/[name].[chunkhash].js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: extractTextPlugin.extract({
                    fallback: "style-loader",
                    use: "css-loader"
                })
            },
            {
                test: /\.tsx?$/,
                use: 'ts-loader'
            },
            {
                test: /\.(png|jpe?g|gif|svg|eot|ttf|woff|woff2)$/,
                loaders: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: './images/[name].[hash].[ext]'
                        }
                    },
                    {
                        loader: 'image-webpack-loader',
                        query: {
                            pngquant: {
                                quality: '65-90',
                                speed: 4,
                                optimizationLevel: 7
                            },
                            gifsicle: {
                                interlaced: false
                            }
                        }
                    }
                ]
            }
        ]
    },
    plugins: [
        new cleanWebpackPlugin(['dist'], cleanOptions),
        new extractTextPlugin(extractTextOptions),
        //new webpack.optimize.UglifyJsPlugin(),
        new htmlWebpackPlugin(htmlOptions)
    ],
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    }
}