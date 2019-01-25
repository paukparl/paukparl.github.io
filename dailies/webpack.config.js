const webpack = require('webpack');
const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');




module.exports = [
  (env) => {

    const mode = env.mode == 'production' ? 'production' : 'development';

    return {
      mode,
      target: 'web', // 'node' --> will not touch built-in's like fs and path
      context: path.resolve(__dirname, 'src'),
      entry: `./dailies/${env.date}/${env.date}.js`,
      output: {
        filename: `${env.date}.bundle.js`,
        path: path.resolve(__dirname, `dist/dailies/${env.date}`)
      },
      node: {
        fs: 'empty'
      },
      plugins: [
        new CleanWebpackPlugin(['dist'])
      ],
      module: {
        rules: [
          {
            test: /\.glsl$/,
            use: [
              {
                loader: 'file-loader',
                options: {
                  name: '[name].[ext]'
                }
              }
            ]
          }
        ]
      }
    };
  }

  // // config for server side bundle
  // ,(env) => {
  //   return;
  // }
]