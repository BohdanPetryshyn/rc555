const hash = require('../utils/hash');

const createKey = (password, keySize) => {
  const passwordHash = hash(password);

  return keySize < password.length
    ? passwordHash.slice(0, keySize)
    : Buffer.concat([passwordHash, hash(passwordHash)], keySize);
};

module.exports = createKey;
