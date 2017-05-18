var webpack = require("webpack");
var path = require('path');
var version = require("./package.json").version;

module.exports = {
    entry: {
        "mousefollower":  path.join(__dirname, "src", "index.js"),
    },
    output: {
        path: path.join(__dirname, 'dist'),
        filename: '[name].js'
    },
    module: {
        loaders: [{
            test: /\.js$/,
            exclude: /node_modules/,
            loader: 'babel-loader'
        }]
    }
};
