const path = require("path");
const common = require("./webpack.common.js");
const { merge } = require("webpack-merge");

module.exports = merge(common, {
  mode: "development",

  devServer: {
    static: path.resolve(__dirname, "dist"),
hot: false,
liveReload: false,
webSocketServer: false,
    port: 9000,
    historyApiFallback: true, 
    client: {
      overlay: {
        errors: true,
        warnings: true,
      },
    },
  },
});