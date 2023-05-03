const path = require('path');

module.exports = {
    mode: 'development',
    entry: {
        main: ['./src/scripts/classes/Player.js', './src/scripts/classes/PhotonManager.js', './src/scripts/scenes/game2.js'],
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist/client'),
    },
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