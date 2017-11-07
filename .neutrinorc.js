const envs = {
  AUTH_DOMAIN: 'auth-dev.mozilla.auth0.com',
  AUTH_CLIENT_ID: 'AKWT8X3N1Qm4YyG6zQjfM22Fo6mblkhv',
  AUTH_AUDIENCE: 'taskcluster-login.ngrok.io',
  AUTH_REDIRECT_URI: 'http://localhost:5050/login',
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
        port: 5050,
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
      neutrino.config
        .when(process.env.NODE_ENV === 'production',
          (config) => config.devtool('source-map'),
          (config) => config.devtool('cheap-module-eval-source-map')
        );

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
