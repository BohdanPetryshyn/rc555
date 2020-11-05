const { Transform } = require('stream');

const xor = require('buffer-xor');

const toChunks = require('../utils/toChunks');

const BlockCryptor = require('./blockcryptor/BlockCryptor');
const createKey = require('./createKey');

const EMPTY_BUFFER = Buffer.alloc(0);

class StreamDecryptor extends Transform {
  constructor(password, keySize, rounds, wordSize) {
    super();
    const wordSizeBytes = wordSize / 8;
    this.blockSize = wordSizeBytes * 2;

    this.blockCryptor = new BlockCryptor(
      createKey(password, keySize),
      rounds,
      wordSize
    );

    this.lastSubChunk = EMPTY_BUFFER;
  }

  _transform(chunk, encoding, callback) {
    chunk = this.readInitBlockIfFirstTransform(chunk);

    const withLastSubChunk = Buffer.concat([this.lastSubChunk, chunk]);
    const blocks = toChunks(withLastSubChunk, this.blockSize);
    this.lastSubChunk = blocks.pop() || EMPTY_BUFFER;

    blocks.map(this.decrypt).forEach(block => this.push(block));

    callback();
  }

  _flush(callback) {
    const lastBlockDecrypted = this.decrypt(this.lastSubChunk);

    const lastBlockTruncated = this.truncateCompleter(lastBlockDecrypted);
    this.push(lastBlockTruncated);

    callback();
  }

  truncateCompleter(block) {
    const completerLength = block.readInt8(block.length - 1);
    return block.slice(0, block.length - completerLength);
  }

  decrypt = block => {
    const decryptedBlock = this.blockCryptor.decrypt(block);

    const mixedDecryptedBlock = xor(decryptedBlock, this.lastBlock);

    this.lastBlock = block;

    return mixedDecryptedBlock;
  };

  readInitBlockIfFirstTransform(chunk) {
    if (this.isFirstTransform()) {
      const lastBlockCipher = chunk.slice(0, this.blockSize);
      this.lastBlock = this.blockCryptor.decrypt(lastBlockCipher);
      return chunk.slice(this.blockSize);
    }

    return chunk;
  }

  isFirstTransform() {
    if (!this.initTransformHandled) {
      this.initTransformHandled = true;
      return true;
    }

    return false;
  }
}

module.exports = StreamDecryptor;
