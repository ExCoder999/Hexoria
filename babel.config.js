module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './src',
            '@theme': './src/theme',
            '@components': './src/components',
            '@screens': './src/screens',
            '@store': './src/store',
            '@services': './src/services',
            '@utils': './src/utils',
            '@types': './src/types',
            '@hooks': './src/hooks',
            '@assets': './src/assets',
          },
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};
