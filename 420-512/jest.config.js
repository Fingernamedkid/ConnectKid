module.exports = {
    preset: 'jest-expo',
    collectCoverage: true,
    collectCoverageFrom: [
        'app/**/*.jsx', // Adjust the pattern to match your source files
      

        '!app/**/_layout.jsx', // Ignore _layout.jsx
        '!**/node_modules/**',
        '!**/vendor/**'
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov'],
    transformIgnorePatterns: [
        'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg)'
    ],
    moduleNameMapper: {
        'react-native-vector-icons/FontAwesome5': '<rootDir>/_mocks_/react-native-vector-icons.js',
        'expo-router': '<rootDir>/_mocks_/expo-router.js',
        '\\.css$': 'identity-obj-proxy',
    },
    setupFiles: ['./_mocks_/async-storage.js'],
};
