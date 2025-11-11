const common = require("./webpack.common.js");
const { merge } = require("webpack-merge");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = merge(common, {
  // Mode produksi mengaktifkan optimasi otomatis seperti minifikasi JS & CSS
  mode: "production",

  module: {
    rules: [
      // CSS Loader — menggantikan style-loader di mode dev
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader, // Ekstrak CSS ke file terpisah
          "css-loader", // Mengubah CSS menjadi modul JS
        ],
      },

      // JavaScript Loader — transpile dengan Babel agar kompatibel di browser lama
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env"],
            },
          },
        ],
      },
    ],
  },

  plugins: [
    // Membersihkan folder dist setiap kali build baru
    new CleanWebpackPlugin(),

    // Mengekstrak semua CSS ke file terpisah
    new MiniCssExtractPlugin({
      filename: "[name].css",
    }),

    // Menyalin file statis penting ke folder dist
    new CopyWebpackPlugin({
      patterns: [
        { from: "src/offline.html", to: "offline.html" },
        { from: "src/manifest.json", to: "manifest.json" },
        { from: "src/icons", to: "icons" },
        { from: "src/service-worker.js", to: "service-worker.js" },
      ],
    }),
  ],
});
