const {Transform} = require('stream');

const hash = require('../utils/hash');

class StreamEncryptor extends Transform {
    constructor(password, keySize, rounds, wordSize) {
        super();
        this.key = this.getKey(password, keySize);
        this.rounds = rounds;
        this.wordSize = wordSize;
    }

    getKey(password, keySize) {
        const passwordHash = hash(password);

        return keySize < password.length
            ? passwordHash.slice(0, keySize)
            : Buffer.concat([passwordHash, hash(passwordHash)], keySize)
    }
}

new StreamEncryptor("helloDota", 64, 12, 2);