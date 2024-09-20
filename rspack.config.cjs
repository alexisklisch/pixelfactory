const path = require('node:path');

module.exports = [
    {
    entry: './src/index.js',
    output: {
      filename: 'bundle.mjs',
      path: path.resolve(__dirname, 'dist'),
      library: {
        type: 'module',
      },
      globalObject: 'this',
      chunkFilename: 'workers/[name].js',
    },
    mode: 'production',
    experiments: {
      outputModule: true
    },

  },
  {
    entry: './src/index.js',
    output: {
      filename: 'bundle.cjs',
      path: path.resolve(__dirname, 'dist'),
      
      library: {
        type: 'commonjs2', // Usamos commonjs2 para compatibilidad con CommonJS
      },
    },
    mode: 'production'
  }
]