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
        minimizer: [new TerserPlugin({
            extractComments: false,
        })],
    },
    externals: {
        'react': 'window.unlayer.React',
        'react-dom': 'window.unlayer.ReactDOM',
        'react-dnd': 'window.unlayer.ReactDND'
    }
};
