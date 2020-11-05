const fs = require('fs');

const StreamDecryptor = require('./crypto/StreamDecryptor');

const defaultOutputFileName = inputFileName => {
  const lastIndexOfExtension = inputFileName.lastIndexOf('.rc555');
  return inputFileName.slice(0, lastIndexOfExtension);
};

const decrypt = ({ argv, keySize, rounds, wordSize }) => {
  const password = argv['p'];
  const inputFileName = argv._[1];
  const outputFileName = argv['o'] || defaultOutputFileName(inputFileName);

  fs.createReadStream(inputFileName)
    .pipe(new StreamDecryptor(password, keySize, rounds, wordSize))
    .pipe(fs.createWriteStream(outputFileName));
};

module.exports = decrypt;
