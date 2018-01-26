const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackIncludeAssetsPlugin = require('html-webpack-include-assets-plugin');

module.exports = {
    entry: "./src/index.tsx",
    output: {
        filename: "bundle.js",
        path: __dirname + "/dist"
    },

    devtool: "source-map",

    resolve: {
        extensions: [".ts", ".tsx", ".js", ".json", ".lua", ".scss"]
    },

    module: {
        rules: [
            { test: /\.lua$/, use: 'raw-loader' },
            {
                test: /\.scss$/,
                use: [
                    { loader: "style-loader" }, 
                    { loader: "css-loader" }, 
                    { loader: "sass-loader" }
                ]
            },
            { test: /\.tsx?$/, loader: "awesome-typescript-loader" },
            { enforce: "pre", test: /\.js$/, loader: "source-map-loader" }
        ]
    },

    plugins: [
        new CleanWebpackPlugin(['dist']),
        new HtmlWebpackPlugin({
            title: 'OC Emulator'
        }),
        new HtmlWebpackIncludeAssetsPlugin({ assets: [
            { path: 'https://fonts.googleapis.com/css?family=Roboto', type: 'css' },
            'https://cdn.jsdelivr.net/npm/es6-promise@4/dist/es6-promise.min.js',
            'https://cdn.jsdelivr.net/npm/es6-promise@4/dist/es6-promise.auto.min.js',
            'https://cdnjs.cloudflare.com/ajax/libs/react/16.2.0/umd/react.production.min.js',
            'https://cdnjs.cloudflare.com/ajax/libs/react-dom/16.2.0/umd/react-dom.production.min.js',
            'https://cdnjs.cloudflare.com/ajax/libs/ace/1.2.9/ace.js',
            'https://fengari.io/static/js/fengari-web.js?v=1'
        ], append: false })
    ],

    externals: {
        "react": "React",
        "react-dom": "ReactDOM",
        "fengari": "fengari"
    },
};