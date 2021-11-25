const path = require("path");
const fs = require("fs");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const appDirectory = fs.realpathSync(process.cwd());

module.exports = {

    entry: {
      'main': path.resolve(appDirectory, "src/main.ts"),
      //'parserTest':'./tests/parser.test.ts',
      //'parserVPTest':'./tests/parserVP.test.ts',
      'login':path.resolve(appDirectory, 'src/controller/ui/login.controller.ts')
    },
    optimization: {
        splitChunks: {
            chunks: 'all',
        },
    },
    output: {
      filename: '[name].bundle.js',
      path: path.resolve(__dirname, 'dist'),
    },
    resolve: {
      extensions: ['.ts', '.js', '.tsx', '.jsx']
    },
    devServer: {
        host: '0.0.0.0',
        port: 9090, //port that we're using for local host (localhost:9090)
        disableHostCheck: true,
        contentBase: path.resolve(appDirectory, "public"), //tells webpack to serve from the public folder
        publicPath: '/',
        hot: true
    },
    devtool: 'eval-source-map',
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/
        },
        {
            test: /\.ya?ml$/,
            type: "json",
            use: "yaml-loader",
            exclude: /node_modules/
        },
        {
            test: /\.(jpe?g|png|gif|svg)$/i,
            loader: 'file-loader',
        }
      ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            chunks:['login'],
            
            template: path.resolve(appDirectory, "public/index.html")
        }),
        new HtmlWebpackPlugin({
          chunks:['main'],
          template: path.resolve(appDirectory, "public/ui.html"),
          filename: 'ui.html'
        }),
        new CleanWebpackPlugin()
    ],
    mode: "development"
  }