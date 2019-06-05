/*
 * Copyright 2019 Bartley Anderson
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

 /**
  * Usage:
  *
  * This script is intended for use in angular projects (it will need to be modified if you want to use it in angular libraries).
  *
  * Place this file in the root of your angular project (the same level as your package.json file).
  *
  * Open a terminal in that directory.
  *
  * Run:
  *
  *     node replace-karma-with-jest.js
  *
  *
  * Delete your node_modules folder.
  *
  * Run:
  *
  *     npm install
  *
  *
  * You should now be able to run tests with either of the following commands:
  *
  *     npm test
  *
  *     npm run test:cov
  *
  *
  * Have a nice day!
  */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const paths = {
  'angularJson': path.resolve('angular.json'),
  'packageJson': path.resolve('package.json'),
  'karmaConfJs': path.resolve('src', 'karma.conf.js'),
  'testTs': path.resolve('src', 'test.ts'),
  'jestConfigJs': path.resolve('src', 'jest.config.js'),
  'tsconfigAppJson': path.resolve('src', 'tsconfig.app.json'),
  'tsconfigSpecJson': path.resolve('src', 'tsconfig.spec.json'),
};

removeKarmaFiles();
createJestConfig();
updatePackageJson();
updateAngularJson();
updateAngularJson();
updateTsConfigAppJson();
updateTsConfigSpecJson();
installJestDependencies();

function removeKarmaFiles() {
  removeFile(paths.karmaConfJs);
  removeFile(paths.testTs);
}

function createJestConfig() {
  const jestConfig = `
  module.exports = {

    collectCoverageFrom: [
      '<rootDir>/src/app/**/*.ts',
      '!<rootDir>/src/app/**/index.ts',
      '!<rootDir>/src/app/**/*.module.ts'
    ],

    coverageDirectory: 'coverage',

    coverageReporters: [
      'lcov',
      'text-summary'
    ],

    testPathIgnorePatterns: [
      '<rootDir>/coverage/',
      '<rootDir>/dist/',
      '<rootDir>/e2e/',
      '<rootDir>/node_modules/',
      '<rootDir>/src/app/*.(js|scss)'
    ],

    testMatch: [
      '<rootDir>/src/app/*.spec.ts',
      '<rootDir>/src/app/**/*.spec.ts'
    ]
  };
  `;
  writeToFile(paths.jestConfigJs, jestConfig);
}

function updatePackageJson() {
  let text = readFromFile(paths.packageJson);
  text = text.replace(/~/g, '').replace(/\^/g, '');
  const json = JSON.parse(text);

  const removeDevDeps = Object.keys(json.devDependencies)
    .filter(d => d.includes('jasmine'))
    .concat(Object.keys(json.devDependencies)
      .filter(d => d.includes('karma')));

  removeDevDeps.forEach(d => {
    delete json.devDependencies[d];
  });

  json.scripts['test:cov'] = 'ng test --coverage'

  const packageJson = JSON.stringify(json, null, 2);
  writeToFile(paths.packageJson, packageJson);
}

function updateAngularJson() {
  const text = readFromFile(paths.angularJson);
  const json = JSON.parse(text);
  const projectName = json.defaultProject;

  json.projects[projectName].architect.test = {
    'builder': '@angular-builders/jest:run',
    'options': {}
  };

  // these are my personal preference - feel free to comment them out
  json.projects[projectName].architect.lint.options.format = "stylish";
  json.projects[projectName].architect.lint.options.force = true;
  json.projects[`${projectName}-e2e`].architect.e2e.options.port = 4299;

  const angularJson = JSON.stringify(json, null, 2);
  writeToFile(paths.angularJson, angularJson);
}

function updateTsConfigAppJson() {
  const text = readFromFile(paths.tsconfigAppJson);
  const json = JSON.parse(text);
  json.exclude = json.exclude.filter(d => d !== 'test.ts');
  const tsconfigAppJson = JSON.stringify(json, null, 2);
  writeToFile(paths.tsconfigAppJson, tsconfigAppJson);
}

function updateTsConfigSpecJson() {
  const text = readFromFile(paths.tsconfigSpecJson);
  const json = JSON.parse(text);
  json.compilerOptions.module = 'commonjs';
  json.compilerOptions.types = ['jest'];
  json.files = json.files.filter(d => d !== 'test.ts');
  const tsconfigSpecJson = JSON.stringify(json, null, 2);
  writeToFile(paths.tsconfigSpecJson, tsconfigSpecJson);
}

function installJestDependencies() {
  execSync('npm i -D jest @types/jest ts-jest @angular-builders/jest');
}

// FILE IO //
function readFromFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function writeToFile(filePath, text) {
  fs.writeFileSync(filePath, text, function(err) {
    if(err) {
      return console.log(err);
    }
  });
}

function removeFile(filePath) {
  try {
    fs.unlinkSync(filePath);
  } catch (err) { }
}
