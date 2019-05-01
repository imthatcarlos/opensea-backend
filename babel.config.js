module.exports = function(api) {
  api.cache(false);

  const presets = ['@babel/preset-env'];
  const plugins = ['@babel/plugin-transform-runtime'];

  return {
    presets, plugins
  };
}
