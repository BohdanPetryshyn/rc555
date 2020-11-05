#!/usr/bin/env node

const parseArgs = require('minimist');

const encrypt = require('./encrypt');
const decrypt = require('./decrypt');

const argv = parseArgs(process.argv.slice(2));

const command = argv._[0];

const keySize = argv['b'] || 128;
const rounds = argv['r'] || 128;
const wordSize = argv['w'] || 32;

switch (command) {
  case 'encrypt':
    encrypt({ argv, keySize, rounds, wordSize });
    break;
  case 'decrypt':
    decrypt({ argv, keySize, rounds, wordSize });
    break;
  default:
    console.log(`Unknown command "${command}".`);
}
