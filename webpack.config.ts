const htmlWebpackPlugin = require('html-webpack-plugin'); //installed via npm
const webpack = require('webpack'); //to access built-in plugins
const extractTextPlugin = require("extract-text-webpack-plugin");
const path = require('path');

module.exports = {
    entry: [
        './src/js/app/index.ts',
        './src/css/index.css'
    ],
    output: {
        filename: 'js/bundle.js',
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
            }
        ]
    },
    plugins: [
        new extractTextPlugin('./css/index.css'),
        //new webpack.optimize.UglifyJsPlugin(),
        new htmlWebpackPlugin({ template: './src/index.html' })
    ],
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },
}