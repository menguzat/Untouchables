const path = require('path');
const WatchExternalFilesPlugin = require('webpack-watch-files-plugin').default

module.exports = {
    mode: 'development',
    entry: {
        main: ['./src/scripts/classes/Player.js', './src/scripts/classes/PhotonManager.js', './src/scripts/scenes/game2.js'],
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist/client'),
    },
    plugins:
    [
        new WatchExternalFilesPlugin({
            files: [
                path.resolve(__dirname, '../src/scripts/classes/Player.js'),
                path.resolve(__dirname, '../src/scripts/classes/PhotonManager.js'),
                path.resolve(__dirname, '../src/scripts/scenes/game2.js'),
            ]
        }),
    ],
    resolve: {
        fallback: {
          crypto: require.resolve("crypto-browserify"),
          stream: require.resolve("stream-browserify")
        }
    },
    experiments: {
        topLevelAwait: true,
      },
};