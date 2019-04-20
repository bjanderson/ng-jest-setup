import path from 'path';
import readline from 'readline';
import { createFolder, getFolderPath, readFromFile, removeFile, writeToFile } from './file-io';

const paths = {
  templates: {
    colorsscss: path.resolve('src', 'templates', 'colorsscss.txt'),
    cursorscss: path.resolve('src', 'templates', 'cursorscss.txt'),
    environmentDev: path.resolve('src', 'templates', 'environment.dev.txt'),
    gitignore: path.resolve('src', 'templates', 'gitignore.txt'),
    globalscss: path.resolve('src', 'templates', 'globalscss.txt'),
    jestconfig: path.resolve('src', 'templates', 'jestconfig.txt'),
    stylescss: path.resolve('src', 'templates', 'stylescss.txt'),
  }
};

confirmMaterial();

///////////////////////////////////////////////////////////////////////////////

function confirmMaterial() {
  const reader = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  reader.question(`Did you add @angular/material? (y/n)`, (b) => {
    reader.close()
    if (b == null || b === '' || b === 'n') {
      console.log('go run: ng add @angular/material');
      process.exit(0);
    } else {
      runSetup();
    }
  });
}

function runSetup() {
  getPaths();
  setupGitignore();
  setupNpmrc();
  setupJestconfig();
  setupAngularJson();
  setupPackagejson();
  setupProxyconfigjson();
  setupTslint();
  deleteKarmaFiles();
  setupTsconfigAppJson();
  setupTsconfigSpecJson();
  setupStyleScss();
  setupGlobalScss();
  setupColorsScss();
  setupCursorScss();
  createEnvironmentDevTs();
}

function getPaths() {
  const folderPath = getFolderPath();

  if (folderPath == null) {
    console.error('\n\nangular project folder does not exist\n\n');
    process.exit(1);
  }

  paths.gitignore = path.resolve(folderPath, '.gitignore');
  paths.npmrc = path.resolve(folderPath, '.npmrc');
  paths.angularJson = path.resolve(folderPath, 'angular.json');
  paths.packageJson = path.resolve(folderPath, 'package.json');
  paths.proxyonfigJson = path.resolve(folderPath, 'proxy-config.json');
  paths.tsconfigJson = path.resolve(folderPath, 'tsconfig.json');
  paths.tslintJson = path.resolve(folderPath, 'tslint.json');

  paths.environmentDev = path.resolve(folderPath, 'src', 'environments', 'environment.dev.ts');
  paths.jestconfig = path.resolve(folderPath, 'src', 'jest.config.js');
  paths.karmaconf = path.resolve(folderPath, 'src', 'karma.conf.js');
  paths.testts = path.resolve(folderPath, 'src', 'test.ts');
  paths.tsconfigAppJson = path.resolve(folderPath, 'src', 'tsconfig.app.json');
  paths.tsconfigSpecJson = path.resolve(folderPath, 'src', 'tsconfig.spec.json');

  paths.stylesFolder = path.resolve(folderPath, 'src', 'styles');
  paths.stylesScss = path.resolve(folderPath, 'src', 'styles.scss');
  paths.colorsScss = path.resolve(paths.stylesFolder, '_colors.scss');
  paths.cursorScss = path.resolve(paths.stylesFolder, '_cursor.scss');
  paths.globalScss = path.resolve(paths.stylesFolder, '_global.scss');

  createFolder(paths.stylesFolder);
}

function deleteKarmaFiles() {
  removeFile(paths.karmaconf);
  removeFile(paths.testts);
}

function setupStyleScss() {
  const text = readFromFile(paths.templates.stylescss);
  writeToFile(paths.stylesScss, text);
}

function setupGlobalScss() {
  const text = readFromFile(paths.templates.globalscss);
  writeToFile(paths.globalScss, text);
}

function setupColorsScss() {
  const text = readFromFile(paths.templates.colorsscss);
  writeToFile(paths.colorsScss, text);
}

function setupCursorScss() {
  const text = readFromFile(paths.templates.cursorscss);
  writeToFile(paths.cursorScss, text);
}

function setupGitignore() {
  const text = readFromFile(paths.templates.gitignore);
  writeToFile(paths.gitignore, text);
}

function setupNpmrc() {
  const text = `# point the registry to your private npm repo
# registry=http://localhost:3020/

save-exact=true`;
  writeToFile(paths.npmrc, text);
}

function setupJestconfig() {
  const text = readFromFile(paths.templates.jestconfig);
  writeToFile(paths.jestconfig, text);
}

function setupTsconfigAppJson() {
  const text = readFromFile(paths.tsconfigAppJson);
  const json = JSON.parse(text);
  json.exclude = json.exclude.filter(d => d !== 'test.ts');
  const newText = JSON.stringify(json, null, 2);
  writeToFile(paths.tsconfigAppJson, newText);
}

function setupTsconfigSpecJson() {
  const text = readFromFile(paths.tsconfigSpecJson);
  const json = JSON.parse(text);
  json.compilerOptions.module = 'commonjs';
  json.compilerOptions.types = ['jest'];
  json.files = json.files.filter(d => d !== 'test.ts');
  const newText = JSON.stringify(json, null, 2);
  writeToFile(paths.tsconfigSpecJson, newText);
}

function setupAngularJson() {
  const text = readFromFile(paths.angularJson);
  const json = JSON.parse(text);
  const projectName = json.defaultProject;

  json.projects[projectName].architect.build.configurations.development = {
    fileReplacements: [
      {
        replace: 'src/environments/environment.ts',
        with: 'src/environments/environment.dev.ts'
      }
    ]
  };

  json.projects[projectName].architect.serve.configurations.development = {
    browserTarget: `${projectName}:build:development`,
    proxyConfig: 'proxy-config.json'
  };


  json.projects[projectName].architect.test = {
    'builder': '@angular-builders/jest:run',
    'options': {}
  };

  json.projects[projectName].architect.lint.options.format = "stylish";
  json.projects[projectName].architect.lint.options.force = true;
  json.projects[`${projectName}-e2e`].architect.e2e.options.port = 4299;

  const newText = JSON.stringify(json, null, 2);
  writeToFile(paths.angularJson, newText);
}


function setupTslint() {
  const text = readFromFile(paths.tslintJson);
  const json = JSON.parse(text);
  json.rules['max-line-length'] = false;
  const newText = JSON.stringify(json, null, 2);
  writeToFile(paths.tslintJson, newText);
}

function setupProxyconfigjson() {
  const json = {
    '/project/api': {
      'target': 'https://localhost:3443',
      'secure': false,
      'changeOrigin': true
    }
  };
  const text = JSON.stringify(json, null, 2);
  writeToFile(paths.proxyonfigJson, text);
}

function setupPackagejson() {
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

  const newDevDeps = {
    '@angular-builders/jest': '7.0.0',
    '@types/jest': '24.0.0',
    'jest': '24.0.0',
    'jest-sonar-reporter': '2.0.0',
  };
  json.devDependencies = Object.assign({}, json.devDependencies, newDevDeps);

  const newDeps = {
    '@ngrx/effects': '6.1.2',
    '@ngrx/router-store': '6.1.2',
    '@ngrx/store': '6.1.2',
    '@ngrx/store-devtools': '6.1.2',
  }
  json.dependencies = Object.assign({}, json.dependencies, newDeps);

  json.scripts = {
    'prebuild': 'npm run clean:build',
    'build': 'ng build',
    'prebuild:prod': 'npm run clean:build',
    'build:prod': 'ng build --configuration=production',
    'clean:build': 'rimraf ./dist',
    'e2e': 'ng e2e',
    'lint': 'ng lint',
    "start": "npm run start:dev",
    "start:dev": "ng serve --configuration=development",
    "start:prod": "ng serve --configuration=production",
    "start:proxy": "ng serve --proxy-config ./proxy-config.json",
    'test': 'ng test',
    'test:clear': 'ng test --clearCache',
    'test:cov': 'ng test --coverage',
    'test:watch': 'ng test --watch'
  }

  const newText = JSON.stringify(json, null, 2);
  writeToFile(paths.packageJson, newText);
}

function createEnvironmentDevTs() {
  const text = readFromFile(paths.templates.environmentDev);
  writeToFile(paths.environmentDev, text);
}
