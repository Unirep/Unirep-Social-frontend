const isTest = String(process.env.NODE_ENV) === 'test'
const isProd = String(process.env.NODE_ENV) === 'production'

module.exports = {
  presets: [
    ['@babel/preset-env', { modules: isTest ? 'commonjs' : false }], 
    '@babel/preset-typescript',
};


// module.exports = {
//   presets: [
//     [
//       "@babel/preset-env",
//       {
//         "modules": "commonjs",
//         "debug": false
//       }
//     ],
//     /// your presets
//   ],
//   plugins: [
//     //... your plugins
//   ]
// };