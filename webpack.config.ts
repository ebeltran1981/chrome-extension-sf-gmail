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

// extract text options
let extractTextOptions = {
    filename: '[name].css'
}

module.exports = {
    entry: [
        './src/js/app/index.ts',
        './src/css/index.css',
        './src/manifest.json'
    ],
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: extractTextPlugin.extract({
                    fallback: "style-loader",
                    use: "css-loader"
                }),
                exclude: /node_modules/
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
            },
            {
                test: /\.(eot|ttf|woff|woff2)$/,
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
        new extractTextPlugin(extractTextOptions),
        new webpack.optimize.UglifyJsPlugin(),
    ],
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    }
}