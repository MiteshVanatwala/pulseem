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
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
    },
    optimization: {
        minimizer: [new TerserPlugin({
            extractComments: false,
        })],
    }
};
