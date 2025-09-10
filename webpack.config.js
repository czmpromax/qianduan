module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules\/(?!quill)/, // 转译 Quill
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
};
