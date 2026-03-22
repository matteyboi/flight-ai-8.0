module.exports = {
  setupFilesAfterEnv: ['<rootDir>/setupTests.js'],
  testEnvironment: 'jsdom',
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['json', 'lcov', 'text', 'clover'],
  reporters: ['default', ['jest-junit', { outputDirectory: 'coverage', outputName: 'junit.xml' }]],
};
