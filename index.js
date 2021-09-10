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
};

const exit = () => {
  clear();
  process.exit();
};

const { prompt } = inquirer;

const SEPARATOR = new inquirer.Separator('\n');

commander.version(appVersion).description(appDescription).parse(process.argv);

const listPrompt = (choices, message) => prompt({ type: 'list', name: 'menu', message, choices, pageSize: 100 });

const handleResponse = ({ menu }, cbs) => (menu in cbs ? cbs[menu]() : cbs.Default());

const topMenu = async (skipreset = false) => {
  if (!skipreset) await reset();

  const defaultMenus = ['Settings'];

  const choices = [SEPARATOR, ...defaultMenus, SEPARATOR, 'Exit'];
  const response = await listPrompt(choices, 'What next');

  await handleResponse(response, {
    Settings: () => settingsMenu(),
    Exit: exit,
  });
};

const settingsMenu = async () => {
  await reset();

  for (const [key, value] of Object.entries(store.get())) {
    console.log(`${chalk.yellowBright(key)}:`, value);
  }
  console.log();

  const settingsChoices = ['TEST'];

  const choices = [SEPARATOR, ...settingsChoices, SEPARATOR, 'Back', 'Exit'];
  const response = await listPrompt(choices, 'What next');

  await handleResponse(response, {
    Back: () => topMenu(),
    Exit: exit,
  });
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
