var webpack           = require('webpack'),
  path              = require('path'),
  ExtractTextPlugin = require('extract-text-webpack-plugin'),
  HtmlWebpackPlugin = require('html-webpack-plugin'),
  bower_dir         = __dirname + '/app/bower_components',
  autoprefixer      = require('autoprefixer-core'),
  csswring          = require('csswring');

const HTMLWebpackPluginConfig = new HtmlWebpackPlugin({
  template: `${__dirname}/src/index.html`,
  filename: 'index.html',
  inject: 'body',
});

module.exports = function(options) {
  var outputPath = options.outputPath,
    entry = {
      bundle  : null
    },
    vendors = [],
    noParse = [],
    loaders = [],
    resolve = {
      alias      : {},
      extensions : ['', '.css', '.scss', '.js']
    };
  var plugins = [
    HTMLWebpackPluginConfig,
    new webpack.HotModuleReplacementPlugin()
  ];

  if (options.status === 'dev') {
    entry.bundle = [
      'webpack-dev-server/client?http://localhost:8080',
      'webpack/hot/only-dev-server',
      './src/index.js',
    ];
    loaders.push(
      { test : /\.(woff|ttf|svg|eot|jpg|png|git)$/, loader: 'url-loader' },
      { test : /\.(js|jsx)$/, loader:'react-hot!babel', include: path.join(__dirname, 'app/src/'), exclude: /node_modules/},
      { test : /\.scss$/, loader:'style!css!postcss!sass?includePaths[]=' + path.resolve(__dirname, './node_modules/compass-mixins/lib') },
      { test : /\.css$/, loader:'style!css' }
    );
  }

  if (options.status === 'deploy') {
    entry.bundle = './src/index.js';
    loaders.push(
      { test : /\.(woff|ttf|svg|eot|jpg|png|git)$/, loader: 'url-loader' },
      { test : /\.(js|jsx)$/, loader:'babel', include: path.join(__dirname, 'app/src/'), exclude: /node_modules/},
      { test : /\.scss$/, loader:ExtractTextPlugin.extract('style','css!postcss!sass?includePaths[]=' + path.resolve(__dirname, './node_modules/compass-mixins/lib')) },
      { test : /\.css$/, loader: ExtractTextPlugin.extract('style', 'css') }
    );
    plugins.push(
      new HtmlWebpackPlugin({
        filename : 'index.html',
        template : 'src/index.html'
      }),
      new ExtractTextPlugin('assets/styles/[name].css'),
      new webpack.optimize.UglifyJsPlugin(),
      new webpack.optimize.DedupePlugin(),
      new webpack.DefinePlugin({
        "process.env" : {
          NODE_ENV : JSON.stringify("production")
        }
      }),
      new webpack.NoErrorsPlugin()
    );
  }
  return{
    entry   : entry,
    output  : {
      path     :  outputPath,
      filename : 'js/[name].js'
    },
    module  : {
      preLoaders: [
        {
          test: /\.jsx$\\.js$/,
          loader: 'eslint-loader',
          include: `${__dirname}/src`,
          exclude: /bundle\.js$/
        }
      ],
      loaders : loaders
    },
    postcss : [autoprefixer, csswring],
    plugins : plugins
  }
}