const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Fix for react-dom/client import in React Native
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  'react-dom/client': require.resolve('./react-dom-client-mock.js'),
};

// Allow Metro to bundle .lottie (dotLottie) files as assets
config.resolver.assetExts = [
  ...(config.resolver.assetExts ?? []),
  'lottie',
];

module.exports = config;
