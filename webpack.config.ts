/*
Copyright AtlanticBT.
 */

import * as cleanWebpackPlugin from "clean-webpack-plugin";
import * as extractTextPlugin from "extract-text-webpack-plugin";
import * as path from "path";
import * as webpack from "webpack"; // to access built-in plugins

const cleanOptions = {
    dry: false,
    root: __dirname,
    verbose: true
};

const cleanWebpack = new cleanWebpackPlugin(["dist"], cleanOptions);

const extractSass = new extractTextPlugin({
    filename: "[name].css",
});

const jsUglify = new webpack.optimize.UglifyJsPlugin();

module.exports = {
    entry: "./src/ts/index.ts",
    output: {
        filename: "[name].js",
        path: path.resolve(__dirname, "dist"),
    },
    module: {
        rules: [
            {
                enforce: "pre",
                test: /\.js$/,
                loader: "source-map-loader",
            },
            {
                enforce: "pre",
                test: /\.tsx?$/,
                use: "source-map-loader",
            },
            {
                test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                use: [
                    {
                        loader: "url-loader",
                        options: {
                            name: "[name].[ext]",
                            limit: 10000,
                            mimetype: "application/font-woff",
                            publicPath: "chrome-extension://__MSG_@@extension_id__/"
                        }
                    }
                ]
            },
            {
                test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                use: [
                    {
                        loader: "file-loader",
                        options: {
                            name: "[name].[ext]",
                            publicPath: "chrome-extension://__MSG_@@extension_id__/"
                        }
                    }
                ]
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
                use: "ts-loader"
            },
            {
                test: /\.(gif|png|jpe?g)$/i,
                loaders: [
                    {
                        loader: "file-loader",
                        options: {
                            name: "[name].[ext]"
                        }
                    },
                    {
                        loader: "image-webpack-loader",
                        query: {
                            pngquant: {
                                quality: "65-90",
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
                loaders: [
                    {
                        loader: "file-loader",
                        options: {
                            name: "[name].[ext]"
                        }
                    }
                ]
            }
        ]
    },
    plugins: [
        cleanWebpack,
        extractSass,
        // jsUglify
    ],
    resolve: {
        extensions: [".ts", ".tsx", ".js"]
    },
    devtool: "inline-source-map"
};
