// module.exports = {
//   testEnvironment: "jest-environment-jsdom",
//   testPathIgnorePatterns: ['<rootDir/node_modules>', ],
//   setupFilesAfterEnv: ['<rootDir>/setupTests.js'],
//   moduleNameMapper: {
//     '\\.(css|scss|sass|less)$/': 'identity-obj-proxy'
//   },
//   // transform: {
//   //   '\\.(js|jsx|ts|tsx)$/': '<rootDir>/node_modules/babel-jest',
//   //   '/^.+.(css|scss|sass|less)$/': 'identity-obj-proxy'
//   // },
//   // see https://jestjs.io/docs/code-transformation for more information on transform option
//   // /\.[jt]sx?$/

//   "transform": {
//     "^.+\\.(jsx)$": "babel-jest",
//   }

// };

module.exports = {
  "roots": [
  "<rootDir>/src"
  ],
  "testMatch": [
  "**/__tests__/**/*.+(ts|tsx|js)",
  "**/?(*.)+(spec|test).+(ts|tsx|js)"
  ],
  "transform": {
  "^.+\\.(ts|tsx)$": "ts-jest"
  },
  "moduleFileExtensions": ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  
  }