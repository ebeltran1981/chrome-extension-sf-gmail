let webpack = require('webpack'); //to access built-in plugins
let extractTextPlugin = require("extract-text-webpack-plugin");
let path = require('path');
let cleanWebpackPlugin = require('clean-webpack-plugin')

// the clean options to use
let cleanOptions = {
    root: __dirname,
    verbose: true,
    dry: false
}

let extractSass = new extractTextPlugin({
    filename: "[name].css",
    disable: process.env.NODE_ENV === "development"
});

module.exports = {
    entry: [
        './src/ts/index.ts',
        './src/scss/index.scss',
        './src/manifest.json'
    ],
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [
            {
                enforce: 'pre',
                test: /\.js$/,
                loader: "source-map-loader"
            },
            {
                enforce: 'pre',
                test: /\.tsx?$/,
                use: "source-map-loader"
            },
            {
                test: /\.(eot|ttf|woff|woff2)$/,
                exclude: /node_modules/,
                use: 'file-loader'
            },
            {
                test: /\.scss$/,
                use: extractSass.extract({
                    use: [
                        {
                            loader: "css-loader"
                        },
                        {
                            loader: "sass-loader"
                        }
                    ],
                    fallback: "style-loader"
                })
            },
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            },
            {
                test: /\.(gif|png|jpe?g|svg)$/i,
                exclude: /node_modules/,
                loaders: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[ext]'
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
            },
            {
                test: /\.(json)$/,
                exclude: /node_modules/,
                loaders: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[ext]'
                        }
                    }
                ]
            }
        ]
    },
    plugins: [
        new cleanWebpackPlugin(['dist'], cleanOptions),
        extractSass
        //new webpack.optimize.UglifyJsPlugin(),
    ],
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },
    devtool: 'inline-source-map'
}