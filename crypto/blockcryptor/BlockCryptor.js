const toSubKeys = require('./toSubKeys');
const readWord = require('./readWord');
const writeWord = require('./writeWord');
const wrap = require('../../math/wrap');
const bitwiseRotation = require('bitwise-rotation').default;


class BlockCryptor {
    constructor(key, rounds, wordSize) {
        this.subKeys = toSubKeys(key, rounds, wordSize);
        this.rounds = rounds;
        this.wordSize = wordSize;
    }

    encrypt(block) {
        let [A, B] = this.toWords(block);
        const rotator = bitwiseRotation(this.wordSize);

        A = wrap(A + this.subKeys[0], this.wordSize);
        B = wrap(B + this.subKeys[1], this.wordSize);

        for (let i = 1; i <= this.rounds; i++) {
            A = wrap(rotator.rol(A ^ B, B) + this.subKeys[2 * i], this.wordSize);
            B = wrap(rotator.rol(B ^ A, A) + this.subKeys[2 * i + 1], this.wordSize);
        }

        return this.toBuffer(A, B);
    }

    decrypt(block) {
        let [A, B] = this.toWords(block);
        const rotator = bitwiseRotation(this.wordSize);

        for (let i = this.rounds; i >= 1; i--) {
            B = rotator.ror(wrap(B - this.subKeys[2 * i + 1], this.wordSize), A) ^ A;
            A = rotator.ror(wrap(A - this.subKeys[2 * i], this.wordSize), B) ^ B;
        }

        B = wrap(B - this.subKeys[1], this.wordSize);
        A = wrap(A - this.subKeys[0], this.wordSize);

        return this.toBuffer(A, B);
    }

    toWords(block) {
        const byteWordSize = this.wordSize / 8;
        return [
            readWord(block, 0, this.wordSize),
            readWord(block, byteWordSize, this.wordSize)
        ];
    }

    toBuffer(word1, word2) {
        const byteWordSize = this.wordSize / 8;
        const buffer = Buffer.alloc(byteWordSize * 2);
        writeWord(buffer, word1, 0, this.wordSize);
        writeWord(buffer, word2, byteWordSize, this.wordSize);

        return buffer;
    }
}
