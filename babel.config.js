module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module:react-native-dotenv',
        {
          moduleName: '@env', // This must match the import name in your code
          path: '.env',       // Path to your .env file (default is '.env')
          safe: false,        // Set to true if you want to enforce .env file presence
          allowUndefined: true, // Allows undefined variables without throwing errors
        },
      ],
    ],
  };
};