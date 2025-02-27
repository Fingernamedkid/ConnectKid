export default {
    transform: {
      '^.+\\.jsx?$': 'babel-jest', // Use babel-jest to transform JavaScript files
    },
    testEnvironment: 'node',
    moduleFileExtensions: ['js', 'json', 'jsx', 'node'],
    transformIgnorePatterns: ['<rootDir>/node_modules/'],
  };