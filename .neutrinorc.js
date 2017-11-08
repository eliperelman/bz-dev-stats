const port = 5080;
const envs = {
  AUTH_DOMAIN: 'auth.mozilla.auth0.com',
  AUTH_CLIENT_ID: '29t2n3LKKnyTbGtWmfTkQpau0mp7QmMH',
  AUTH_REDIRECT_URI: `http://localhost:${port}/login`,
  AUTH_RESPONSE_TYPE: 'token id_token',
  AUTH_SCOPE: 'openid profile',
  STATS_URL: 'http://localhost:5090/stats'
};

// Set environment variables to their default values if not defined
Object
  .keys(envs)
  .forEach(env => !(env in process.env) && (process.env[env] = envs[env]));

module.exports = {
  use: [
    ['neutrino-preset-react', {
      html: {
        title: 'Bugzilla Developer Stats'
      },
      devServer: {
        port,
        historyApiFallback: { disableDotRule: true }
      },
      babel: {
        plugins: [
          require.resolve('babel-plugin-recharts')
        ]
      }
    }],
    ['neutrino-middleware-env', Object.keys(envs)],
    (neutrino) => {
      neutrino.config.when(process.env.NODE_ENV === 'production', (config) => {
        config.plugin('minify').tap(() => [{ evaluate: false }]);
      });
      neutrino.config.when(process.env.NODE_ENV === 'development', (config) => {
        config.devtool('cheap-module-eval-source-map');
      });

      neutrino.config.module.rules.delete('style');

      neutrino.config.module
        .rule('local-sass')
          .test(/\.scss/)
          .include
            .add(path => path.startsWith(neutrino.options.source) && !path.includes('global'))
            .end()
          .use('style')
            .loader(require.resolve('style-loader')).end()
          .use('css')
            .loader(require.resolve('css-loader')).end()
          .use('sass')
            .loader(require.resolve('sass-loader'));

      neutrino.config.module
        .rule('local-css')
          .test(/\.css$/)
          .include
            .add(path => path.startsWith(neutrino.options.source) && !path.includes('global'))
            .end()
          .use('style')
            .loader(require.resolve('style-loader')).end()
          .use('css')
            .loader(require.resolve('css-loader'))
            .options({ modules: true });

      neutrino.config.module
        .rule('global-sass')
          .test(/\.scss/)
          .include
            .add(path => !path.startsWith(neutrino.options.source))
            .end()
          .use('style')
            .loader(require.resolve('style-loader')).end()
          .use('css')
            .loader(require.resolve('css-loader')).end()
          .use('sass')
            .loader(require.resolve('sass-loader'));

      neutrino.config.module
        .rule('global-css')
          .test(/\.css$/)
          .include
            .add(path => !path.startsWith(neutrino.options.source))
            .end()
          .use('style')
            .loader(require.resolve('style-loader')).end()
          .use('css')
            .loader(require.resolve('css-loader'))
            .options({ modules: false });
    }
  ]
};
