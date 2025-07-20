module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // Ensure proper class transformation for Hermes
    ['@babel/plugin-transform-class-properties', { loose: true }],
    ['@babel/plugin-transform-private-methods', { loose: true }],
    ['@babel/plugin-transform-private-property-in-object', { loose: true }],
  ],
};
