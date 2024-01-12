module.exports = {
  moduleNameMapper: {
    '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
  },
  setupFilesAfterEnv: ['<rootDir>/config/setupTests.js'],
  setupFiles: ['<rootDir>/config/jest.polyfills.js'],
  testEnvironment: '<rootDir>/config/jsdom-extended.js',
  testEnvironmentOptions: {
    customExportConditions: [''],
  },
  transform: {
    '\\.js$': ['babel-jest', { configFile: './XXXbabel.config.js' }],
  },
};
