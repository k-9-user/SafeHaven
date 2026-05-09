module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Required for react-native-reanimated
      'react-native-reanimated/plugin',
      // Path aliases (must match tsconfig.json paths)
      [
        'module-resolver',
        {
          root: ['./src'],
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
          alias: {
            '@': './src',
            '@screens': './src/screens',
            '@components': './src/components',
            '@voice': './src/voice',
            '@wallet': './src/wallet',
            '@defi': './src/defi',
            '@learning': './src/learning',
            '@i18n': './src/i18n',
            '@a11y': './src/accessibility',
            '@security': './src/security',
            '@hooks': './src/hooks',
            '@store': './src/store',
            '@navigation': './src/navigation',
          },
        },
      ],
    ],
  };
};
