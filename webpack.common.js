const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: {
    app: path.resolve(__dirname, "src/scripts/index.js"),
  },
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "dist"),
    clean: true, // Membersihkan folder dist sebelum build baru
    publicPath: "/projek-cerita-menarik/", // Agar Webpack tahu tempat mencari aset
  },

  // KRITIS: Menangani path di leaflet.css
  resolve: {
    alias: {
      // Alias ini membantu css-loader menemukan file di node_modules
      "~leaflet": path.resolve(__dirname, "node_modules/leaflet"),
    },
  },

  module: {
    rules: [
      // 1. Rule untuk CSS
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },

      // 2. Rule untuk Babel (transpile JS modern ke versi lama)
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },

      // 3. Rule untuk Assets (termasuk ikon Leaflet: marker-icon.png)
      {
        test: /\.(png|jpe?g|gif|svg|webp)$/i,
        type: "asset/resource",
        generator: {
          // WAJIB: Aset disimpan di folder images/
          filename: "images/[name].[ext]",
        },
      },
    ],
  },

  plugins: [
    new HtmlWebpackPlugin({
      filename: "index.html",
      template: path.resolve(__dirname, "src/index.html"),
    }),

    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "src/public/"),
          to: path.resolve(__dirname, "dist/"),
          globOptions: {
            ignore: ["**/images/**"], // Jangan duplikasi folder images
          },
        },
      ],
    }),
  ],
};
