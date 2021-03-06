const { watch, series, src } = require('gulp')
const clean = require('gulp-clean')
const { resolve } = require('path')
const { webpack } = require('webpack')
const TerserPlugin = require('terser-webpack-plugin')

const isDev = process.argv.indexOf('--develop') >= 0
const destDir = resolve(__dirname, './assets/js')

const webpackConfig = {
  mode: isDev ? 'development' : 'production',
  entry: ['./lib/index.js'],
  output: {
    path: destDir,
    filename: 'bundle.js',
    library: {
      type: 'umd'
    }
  },
  target: 'browserslist',
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true
            }
          }
        ]
      }
    ]
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        parallel: true,
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true
          }
        }
      })
    ]
  }
}

const webpackCallback = (err, stats) => {
  if (!err) {
    console.log(
      stats.toString({
        assets: true,
        cached: false,
        colors: true,
        children: false,
        errors: true,
        warnings: true,
        version: true,
        modules: false,
        publicPath: true
      })
    )
  } else {
    console.log(err)
  }
}

function convertScript() {
  console.log('开始执行js转换...')
  if (isDev) {
    webpack(Object.assign(webpackConfig, { devtool: 'source-map' })).run(webpackCallback)
  } else {
    webpack(webpackConfig).run(webpackCallback)
  }
}

function cleanDist() {
  console.log('开始清理assets/js文件夹下文件...')
  return src(['bundle.js', 'bundle.js.map'], {
    cwd: destDir,
    base: destDir,
    allowEmpty: true
  }).pipe(clean())
}

function listen() {
  console.log('开始监听lib下面的js文件...')
  return watch(['lib/*.js'], build)
}

function build(cb) {
  convertScript()
  cb()
}

exports.default = series(cleanDist, build, listen)
exports.build = series(cleanDist, build)
