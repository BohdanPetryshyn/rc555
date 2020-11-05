const fs = require('fs');

const StreamEncryptor = require('./crypto/StreamEncryptor');

const getDefaultOutputFileName = inputFileName => inputFileName + '.rc555';

const encrypt = ({ argv, keySize, rounds, wordSize }) => {
  const password = argv['p'];
  const inputFileName = argv._[1];
  const outputFileName = argv['o'] || getDefaultOutputFileName(inputFileName);

  fs.createReadStream(inputFileName)
    .pipe(new StreamEncryptor(password, keySize, rounds, wordSize))
    .pipe(fs.createWriteStream(outputFileName));
};

module.exports = encrypt;
