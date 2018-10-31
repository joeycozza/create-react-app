const fs = require('fs-extra');
const os = require('os');
const path = require('path');
const spawn = require('react-dev-utils/crossSpawn');
const inquirer = require('inquirer');

module.exports = {
  installFrontierDependencies,
  promptForConfig,
  packageJsonWritten,
};

async function promptForConfig() {
  const questions = [
    {
      type: 'checkbox',
      name: 'additionalFeatures',
      message: 'What additional features does your app require',
      choices: [
        {
          value: 'polymer',
          name: 'Using a shared Polymer Component?',
        },
        {
          value: 'redux',
          name: 'Redux',
        },
      ],
    },
  ];
  const answers = await inquirer.prompt(questions);
  console.log('answers: ', answers);
  return answers;
}

function packageJsonWritten() {}

function installFrontierDependencies(appPath, answers) {
  const npmInstallArgs = [
    'install',
    '--save',
    'http-proxy-middleware@0.19.0',
    'i18next@11.9.0',
    'i18next-browser-languagedetector@2.2.3',
    'i18next-pseudo@2.0.1',
  ];
  const { polymer, redux } = answers.additionalFeatures;

  if (polymer) {
    configurePolymer(appPath);
  }
  if (redux) {
    configureRedux();
  }

  const proc = spawn.sync('npm', npmInstallArgs, { stdio: 'inherit' });
  if (proc.status !== 0) {
    console.error(`\`npm ${npmInstallArgs.join(' ')}\` failed`);
    return;
  }
}

function configurePolymer(appPath) {
  const appPackage = require(path.join(appPath, 'package.json'));
  appPackage.vendorCopy = [
    {
      from:
        'node_modules/@webcomponents/webcomponentsjs/custom-elements-es5-adapter.js',
      to: 'public/vendor/custom-elements-es5-adapter.js',
    },
    {
      from:
        'node_modules/@webcomponents/webcomponentsjs/webcomponents-bundle.js',
      to: 'public/vendor/webcomponents-bundle.js',
    },
  ];
  //TODO: this may cause issues in the future if react-scripts add a postinstall script
  appPackage.scripts.postinstall = 'vendor-copy';

  fs.writeFileSync(
    path.join(appPath, 'package.json'),
    JSON.stringify(appPackage, null, 2) + os.EOL
  );

  const proc = spawn.sync(
    'npm',
    [
      [
        'install',
        '--save-dev',
        'vendor-copy@2.0.0',
        '@webcomponents/webcomponentsjs@2.1.3',
      ],
    ],
    { stdio: 'inherit' }
  );
  if (proc.status !== 0) {
    console.error(
      `\`npm ${['install', '--save-dev', 'vendor-copy@2.0.0'].join(
        ' '
      )}\` failed`
    );
    return;
  }
  //
  //TODO: read in the appPath's template and inject the code necessary for polymer to work
}

function configureRedux() {
  // if yes to redux
  // 'react-redux@5.0.7',
  //   'react-router-dom@4.3.1',
  //   'react-router-redux@4.0.8',
  //   'redux@4.0.0',
  //   'redux-logger@3.0.6',
  //   'redux-thunk@2.3.0',
}
