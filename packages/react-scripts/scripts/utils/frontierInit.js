'use strict';

const fs = require('fs-extra');
const os = require('os');
const path = require('path');
const inquirer = require('inquirer');
const osUtils = require('./osUtils');

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
  return answers;
}

function packageJsonWritten() {}

function installFrontierDependencies(appPath, answers, useYarn) {
  const { additionalFeatures } = answers;

  if (additionalFeatures.includes('polymer')) {
    configurePolymer(appPath, useYarn);
  }
  if (additionalFeatures.includes('redux')) {
    configureRedux(appPath, useYarn);
  }

  const defaultModules = [
    'http-proxy-middleware@0.19.0',
    'i18next@11.9.0',
    'i18next-browser-languagedetector@2.2.3',
    'i18next-pseudo@2.0.1',
  ];
  installModulesSync(defaultModules, useYarn);
}

function configurePolymer(appPath, useYarn) {
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

  const { postinstall } = appPackage.scripts;
  appPackage.scripts.postinstall = postinstall
    ? `${postinstall} && `
    : '' + 'vendor-copy';

  fs.writeFileSync(
    path.join(appPath, 'package.json'),
    JSON.stringify(appPackage, null, 2) + os.EOL
  );

  const polymerModules = [
    'vendor-copy@2.0.0',
    '@webcomponents/webcomponentsjs@2.1.3',
  ];
  installModulesSync(polymerModules, useYarn, true);

  //TODO: read in the appPath's template and inject the code necessary for polymer to work
}

function configureRedux(appPath, useYarn) {
  const reduxModules = [
    'react-redux@5.0.7',
    'react-router-dom@4.3.1',
    'react-router-redux@4.0.8',
    'redux@4.0.0',
    'redux-logger@3.0.6',
    'redux-thunk@2.3.0',
  ];
  installModulesSync(reduxModules, useYarn);
}

function installModulesSync(modules, useYarn, saveDev = false) {
  const { command, args } = buildInstallCommandAndArgs(useYarn, saveDev);
  osUtils.runExternalCommandSync(command, args.concat(modules));
}

function buildInstallCommandAndArgs(useYarn, saveDev = false) {
  let command;
  let args;
  if (useYarn) {
    command = 'yarnpkg';
    args = ['add'];
    if (saveDev) {
      args.push('--dev');
    }
  } else {
    command = 'npm';
    args = ['install', '--save'];
    if (saveDev) {
      args[1] = '--save-dev';
    }
  }
  return { command, args };
}
