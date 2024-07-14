var path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
    entry: './App.js',
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: `app.bundle.[hash].${new Date()}.js`
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['env', 'react']
                    }
                }
            }]
    },
    optimization: {
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
        minimizer: [new TerserPlugin({
            extractComments: false,
        })],
    },
    resolve: {
        fallback: {
            "os": require.resolve("os-browserify/browser"),
            "fs": false,
            "tls": false,
            "net": false,
            "path": false,
            "zlib": false,
            "http": false,
            "https": false,
            "stream": false,
            "crypto": false
        }
    },
};
