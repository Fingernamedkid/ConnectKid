const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Define your module aliases here
const ALIASES = {
  'react-native-maps': '@teovilla/react-native-web-maps',
  // Add other aliases as needed
};

config.resolver.sourceExts = [...config.resolver.sourceExts, 'web.js', 'web.jsx', 'web.ts', 'web.tsx'];

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web') {
    // The alias will only be used when bundling for the web.
    return context.resolveRequest(context, ALIASES[moduleName] ?? moduleName, platform);
  }
  // Ensure you call the default resolver.
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: "./global.css" });