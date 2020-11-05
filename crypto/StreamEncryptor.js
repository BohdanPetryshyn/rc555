const { Transform } = require('stream');

const xor = require('buffer-xor');

const getRandomBuffer = require('../utils/getRandomBuffer');
const toChunks = require('../utils/toChunks');

const BlockCryptor = require('./blockcryptor/BlockCryptor');
const createKey = require('./createKey');

const EMPTY_BUFFER = Buffer.alloc(0);

class StreamEncryptor extends Transform {
  constructor(password, keySize, rounds, wordSize) {
    super();
    const wordSizeBytes = wordSize / 8;
    this.blockSize = wordSizeBytes * 2;

    this.blockCryptor = new BlockCryptor(
      createKey(password, keySize),
      rounds,
      wordSize
    );

    this.lastBlockCipher = this.getInitBlock();
    this.lastSubBlock = EMPTY_BUFFER;
  }

  _transform(chunk, encoding, callback) {
    this.writeInitBlockIfFirstTransform();

    const withLastSubBlock = Buffer.concat([chunk, this.lastSubBlock]);
    const blocks = toChunks(withLastSubBlock, this.blockSize);
    this.lastSubBlock = blocks.pop() || EMPTY_BUFFER;

    blocks.forEach(this.processBlock);

    callback();
  }

  _flush(callback) {
    const completedBlocks = this.completeLastBlock();

    toChunks(completedBlocks, this.blockSize).forEach(this.processBlock);

    callback();
  }

  completeLastBlock() {
    const lastBlockIncompletenessBytes =
      this.blockSize - (this.lastSubBlock.length % this.blockSize);
    const blockCompleter = this.getBlockCompleter(lastBlockIncompletenessBytes);

    return Buffer.concat([this.lastSubBlock, blockCompleter]);
  }

  getBlockCompleter(incompleteness) {
    const completer = Buffer.alloc(incompleteness);
    completer.fill(incompleteness);
    return completer;
  }

  processBlock = block => {
    const withLastBlockCipher = xor(this.lastBlockCipher, block);

    this.lastBlockCipher = this.blockCryptor.encrypt(withLastBlockCipher);

    this.push(this.lastBlockCipher);
  };

  writeInitBlockIfFirstTransform() {
    if (this.isFirstTransform()) {
      const initBlock = this.lastBlockCipher;
      const encryptedInitBlock = this.blockCryptor.encrypt(initBlock);
      this.push(encryptedInitBlock);
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
}

module.exports = StreamEncryptor;
