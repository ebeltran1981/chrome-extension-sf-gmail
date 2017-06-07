/*
Copyright AtlanticBT.
 */

import * as cleanWebpackPlugin from "clean-webpack-plugin";
import * as extractTextPlugin from "extract-text-webpack-plugin";
import * as path from "path";
import * as webpack from "webpack"; // to access built-in plugins
import * as uglifyJsPlugin from "webpack-uglify-harmony-package";

const cleanOptions = {
    dry: false,
    root: __dirname,
    verbose: true
};

const cleanWebpack = new cleanWebpackPlugin(["dist"], cleanOptions);

const extractSass = new extractTextPlugin({
    filename: "css/[name].css",
});

const uglifyJs = new uglifyJsPlugin();

module.exports = {
    entry: {
        webPage: "./src/ts/webPage.ts",
        contentScripts: "./src/ts/contentScripts.ts",
        backgroundEvents: "./src/ts/backgroundEvents.ts"
    },
    output: {
        filename: "js/[name].js",
        path: path.resolve(__dirname, "dist"),
    },
    module: {
        rules: [
            {
                test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                use: [
                    {
                        loader: "url-loader",
                        options: {
                            name: "fonts/[name].[ext]",
                            limit: 10000,
                            mimetype: "application/font-woff",
                            publicPath: "chrome-extension://__MSG_@@extension_id__/"
                        }
                    }
                ]
            },
            {
                test: /fonts\/(.+)\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                use: [
                    {
                        loader: "file-loader",
                        options: {
                            name: "fonts/[name].[ext]",
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
                test: /images\/(.+)\.(gif|png|jpe?g|svg)$/i,
                loaders: [
                    {
                        loader: "file-loader",
                        options: {
                            name: "images/[name].[ext]"
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
                test: /\.(html)$/i,
                loaders: [
                    {
                        loader: "file-loader",
                        options: {
                            name: "views/[name].[ext]"
                        }
                    }
                ]
            },
            {
                test: /src\/manifest\.json$/,
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
        uglifyJs
    ],
    resolve: {
        extensions: [".ts", ".tsx", ".js"]
    }
};
