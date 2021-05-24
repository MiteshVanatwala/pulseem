var path = require('path');

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
    }
};
