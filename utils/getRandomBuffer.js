const crypto = require('crypto');

const getRandomBuffer = length => crypto.randomBytes(length);

module.exports = getRandomBuffer;
