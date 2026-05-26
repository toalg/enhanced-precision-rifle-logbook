module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // Ensure proper class transformation for Hermes
    ['@babel/plugin-transform-class-properties', { loose: true }],
    ['@babel/plugin-transform-private-methods', { loose: true }],
    ['@babel/plugin-transform-private-property-in-object', { loose: true }],
  ],
  env: {
    // Production builds (Metro sets NODE_ENV=production for release bundles)
    // strip console.log calls so they don't leak into shipped binaries.
    // console.warn and console.error survive so Sentry can capture them.
    production: {
      plugins: [
        ['transform-remove-console', { exclude: ['warn', 'error'] }],
      ],
    },
  },
};
