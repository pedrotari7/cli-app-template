#!/usr/bin/env node
const fs = require('fs');
const inquirer = require('inquirer');
const commander = require('commander');
const clear = require('clear');
const figlet = require('figlet');
const chalk = require('chalk');
const nodeFetch = require('node-fetch');
const fetch = require('fetch-cookie')(nodeFetch);
const printImage = require('print-image-cli');
const crypto = require('crypto');

inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'));

const appDescription = 'CLI App';
const appVersion = '1.0.0';

let globalMessage;
let previousMenu = [];

const logoPath = `${__dirname}/images/logo.png`;
const storePath = `${__dirname}/store.json`;

const store = require('data-store')({ path: storePath });

const reset = async () => {
  clear();

  if (process.env.TERM_PROGRAM === 'iTerm.app') {
    await showImage(logoPath);
  } else {
    console.log(chalk.blueBright(figlet.textSync('CLI APP')));
  }

  if (globalMessage) {
    process.stdout.write(globalMessage);
    globalMessage = '';
  }
};

const exit = () => {
  clear();
  process.exit();
};

const { prompt } = inquirer;

const SEPARATOR = new inquirer.Separator('\n');

commander.version(appVersion).description(appDescription).parse(process.argv);

const topMenu = async (skipreset = false) => {
  if (!skipreset) await reset();

  const defaultMenus = ['Settings'];

  const response = await prompt({
    type: 'list',
    name: 'menu',
    message: 'What next',
    choices: [SEPARATOR, ...defaultMenus, SEPARATOR, 'Exit'],
    pageSize: 100,
  });

  switch (response.menu) {
    case 'Settings':
      settingsMenu();
      break;
    case 'Exit':
      exit();
      break;
    default:
      break;
  }
  previousMenu.push(topMenu);
};

const settingsMenu = async () => {
  await reset();

  for (const [key, value] of Object.entries(store.get())) {
    console.log(`${chalk.yellowBright(key)}:`, value);
  }
  console.log();

  const settingsChoices = ['TEST'];

  const response = await prompt({
    type: 'list',
    name: 'menu',
    message: 'Settings',
    choices: [SEPARATOR, ...settingsChoices, SEPARATOR, 'Back', 'Exit'],
    pageSize: 100,
  });

  switch (response.menu) {
    case 'Back':
      previousMenu.pop()();
      break;
    case 'Exit':
      exit();
      break;
    default:
      settingsMenu();
      break;
  }
  previousMenu.push(settingsMenu);
};

const showImage = async (path) => {
  let imagePath = path;

  if (imagePath.startsWith('http')) {
    const imageFolder = `${__dirname}/images/downloaded`;
    const hash = crypto.createHash('md5').update(imagePath).digest('hex');
    const hashPath = `${imageFolder}/${hash}`;
    if (fs.existsSync(hashPath)) {
      imagePath = hashPath;
    } else {
      const imageResponse = await fetch(imagePath);

      fs.mkdirSync(imageFolder, { recursive: true });

      imagePath = hashPath;
      const dest = fs.createWriteStream(hashPath);
      imageResponse.body.pipe(dest);
    }
  }
  await printImage(imagePath);
};

// Main
topMenu();
