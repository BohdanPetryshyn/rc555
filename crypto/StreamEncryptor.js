const {Transform} = require('stream');

const xor = require('buffer-xor');

const hash = require('../utils/hash');
const getRandomBuffer = require('../utils/getRandomBuffer');
const toChunks = require('../utils/toChunks');

const BlockCryptor = require('./blockcryptor/BlockCryptor');

class StreamEncryptor extends Transform {
    constructor(password, keySize, rounds, wordSize) {
        super();
        const wordSizeBytes = wordSize / 8;
        this.blockSize = wordSizeBytes * 2;

        this.blockCryptor = new BlockCryptor(
            this.getKey(password, keySize),
            rounds,
            wordSize
        );

        this.lastBlockCipher = this.getInitBlock();
        this.lastSubBlock = Buffer.alloc(0);
    }

    _transform(chunk, encoding, callback) {
        this.writeInitBlockIfFirstTransform();

        const withLastSubBlock = Buffer.concat([chunk, this.lastSubBlock]);
        const blocks = toChunks(withLastSubBlock, this.blockSize);
        this.lastSubBlock = blocks.pop();

        blocks.forEach(this.processBlock);

        callback();
    }

    _flush(callback) {
        const completedBlocks = this.completeLastBlock();

        toChunks(completedBlocks, this.blockSize)
            .forEach(this.processBlock);

        callback();
    }

    completeLastBlock() {
        const lastBlockIncompletenessBytes = this.blockSize - (this.lastSubBlock.length % this.blockSize);
        const blockCompleter = this.getBlockCompleter(lastBlockIncompletenessBytes);

        return Buffer.concat([this.lastSubBlock, blockCompleter]);
    }

    getBlockCompleter(incompleteness) {
        const completer =  Buffer.alloc(incompleteness);
        completer.fill(incompleteness);
        return completer;
    }

    processBlock = block => {
        const withLastBlockCipher = xor(this.lastBlockCipher, block);

        this.lastBlockCipher = this.blockCryptor.encrypt(withLastBlockCipher);

        this.push(
            this.lastBlockCipher
        );
    }

    writeInitBlockIfFirstTransform() {
        if (this.isFirstTransform()) {
            const initBlock = this.lastBlockCipher;

            this.push(
                this.blockCryptor.encrypt(initBlock)
            );
        }
    }

    isFirstTransform() {
        if (!this.initTransformHandled) {
            this.initTransformHandled = true;
            return true;
        }

        return false;
    }

    getInitBlock() {
        return getRandomBuffer(this.blockSize);
    }

    getKey(password, keySize) {
        const passwordHash = hash(password);

        return keySize < password.length
            ? passwordHash.slice(0, keySize)
            : Buffer.concat([passwordHash, hash(passwordHash)], keySize)
    }
}

module.exports = StreamEncryptor;