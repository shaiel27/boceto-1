module.exports = function override(config, env) {
  if (env === 'production') {
    const terserPlugins = config.optimization.minimizer.filter(
      (p) => p.constructor.name === 'TerserPlugin'
    );
    for (const plugin of terserPlugins) {
      const opts = plugin.options || {};
      opts.terserOptions = opts.terserOptions || {};
      opts.terserOptions.compress = opts.terserOptions.compress || {};
      opts.terserOptions.compress.drop_console = true;
      opts.terserOptions.compress.drop_debugger = true;
      plugin.options = opts;
    }
  }
  return config;
};
