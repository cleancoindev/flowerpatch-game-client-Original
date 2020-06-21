const IS_DEV = (process.env.NODE_ENV !== 'production');

module.exports = {
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader"
                }
            }, {
                test: /\.(css|less)$/,
                use: [ {
                    loader: 'style-loader'
                }, {
                    loader: 'css-loader',
                    options: {
                        url: false,
                        modules: true,
                        sourceMap: IS_DEV,
                    }
                }, {
                    loader: 'less-loader',
                    options: {
                        sourceMap: IS_DEV
                    }
                } ]
            }
        ]
    }
};
