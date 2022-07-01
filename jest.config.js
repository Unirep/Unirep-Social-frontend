
module.exports = {
  roots: ['<rootDir>'],
  transform: {
    '^.+\\.(ts|tsx|js|jsx)?$': 'ts-jest'
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.js?$',
  moduleFileExtensions: ['tsx', 'js', 'json', 'node'],
  // collectCoverage: true,
  clearMocks: true,
  // coverageDirectory: "coverage",
  setupFilesAfterEnv: [
    "<rootDir>/setupTests.js"
  ]
};