const path = require('path');
const Minify = require('babel-minify-webpack-plugin');
const webpack = require('webpack');

// Create an object map of entry file arrays keyed by submodule.
const entries = {
  intercept_event: ['eventList'],
  intercept_location: ['locationsList'],
  intercept_room_reservation: ['reserveRoom'],
};

const babelLoader = {
  test: /\.js$/,
  loader: 'babel-loader',
  exclude: ['/node_modules/'],
  query: {
    plugins: [
      'external-helpers',
      'transform-class-properties',
      'transform-decorators-legacy',
      'transform-object-rest-spread',
      'transform-es3-member-expression-literals',
    ],
    presets: [
      'react',
      'stage-0',
      'es2015',
      [
        'env',
        {
          modules: false,
          targets: {
            browsers: ['last 2 versions'],
          },
        },
      ],
    ],
  },
};

/**
 * Turn the entry map into a valid entry config object.
 *
 * @param {Object} entries
 *   Map of entry file arrays keyed by submodule.
 *   Example: { "submodule_name": ["entry1, entry2"]}
 * @return {Object}
 *   A valid Webpack entry config object
 */
function createEntryConfig(entries) {
  const output = {};

  // Loop over each module.
  Object.keys(entries).forEach((module) => {
    // Loop over each entry.
    entries[module].forEach((entry) => {
      // Set the entry name to a relative path to the output directory so it
      // can be used as a dynamic placeholder in the output config.
      output[`modules/${module}/js/dist/${entry}`] = `./modules/${module}/js/src/${entry}.js`;
    });
  });

  return output;
}

/**
 * Webpack config
 */
module.exports = function config(env) {
  const isProduction = env.production === true;

  return [
    {
      entry: createEntryConfig(entries),
      output: {
        filename: '[name].js',
        path: path.resolve(__dirname),
      },
      resolve: {
        // Allow common modules in the root module to be referenced.
        modules: [path.resolve(__dirname, 'js/src'), 'node_modules'],
      },
      devtool: (() => (isProduction ? 'none' : 'cheap-module-eval-source-map'))(),
      plugins: (() => {
        const nodeEnv = isProduction ? 'production' : 'development';
        const plugins = [
          new webpack.DefinePlugin({ 'process.env': { NODE_ENV: JSON.stringify(nodeEnv) } }),
          new webpack.optimize.CommonsChunkPlugin({
            name: 'modules/intercept_core/js/dist/interceptCommon',
            filename: '[name].js',
          }),
        ];

        if (isProduction) {
          plugins.push(
            new Minify({
              deadcode: false,
            }),
          );
        }

        return plugins;
      })(),
      externals: (() => {
        const prod = {
          react: 'React',
          'react-dom': 'ReactDOM',
          interceptClient: 'interceptClient',
          drupalSettings: 'drupalSettings',
          moment: 'moment',
          redis: 'redis',
        };
        const dev = {
          interceptClient: 'interceptClient',
          drupalSettings: 'drupalSettings',
          redis: 'redis',
          moment: 'moment',
        };

        return isProduction ? prod : dev;
      })(),
      module: {
        loaders: [babelLoader],
      },
    },

    //
    // interceptClient.js
    //   This should function as a standalone library so it needs its own config.
    //
    {
      entry: {
        'modules/intercept_core/js/dist/interceptClient':
          './modules/intercept_core/js/src/interceptClient.js',
      },
      output: {
        filename: '[name].js',
        path: path.resolve(__dirname),
        libraryTarget: 'umd',
      },
      resolve: {
        // Allow common modules in the root module to be referenced.
        modules: [path.resolve(__dirname, 'js/src'), 'node_modules'],
      },
      plugins: (() => {
        const nodeEnv = isProduction ? 'production' : 'development';
        const plugins = [
          new webpack.DefinePlugin({ 'process.env': { NODE_ENV: JSON.stringify(nodeEnv) } }),
        ];

        if (isProduction) {
          plugins.push(new Minify());
        }

        return plugins;
      })(),
      externals: (() => {
        const prod = {
          drupalSettings: 'drupalSettings',
          moment: 'moment',
          redis: 'redis',
        };
        const dev = {
          drupalSettings: 'drupalSettings',
          moment: 'moment',
          redis: 'redis',
        };

        return isProduction ? prod : dev;
      })(),
      module: {
        loaders: [babelLoader],
      },
    },
  ];
};
