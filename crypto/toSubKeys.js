const bitwiseRotation = require('bitwise-rotation').default;

console.log(bitwiseRotation)

const {
    ofSize,
    UInt16,
    UInt32,
} = require('../math/Integer');

const PQ = {
    16: {
        P: UInt16(0xb7e1),
        Q: UInt16(0x9e37)
    },
    32: {
        P: UInt32(0xb7e15163),
        Q: UInt32(0x9e3779b9)
    }
}

const readWord = (key, position, wordSize) => {
    switch (wordSize) {
        case 16:
            return UInt16(key.readUInt16LE(position));
        case 32:
            return UInt32(key.readUInt32LE(position));
    }
}

const toWords = (key, wordSize) => {
    const words = [];
    let nextPosition = 0;
    const byteWordSize = wordSize / 8;

    while (nextPosition < key.length) {
        nextPosition += byteWordSize;
        words.push(readWord(key, nextPosition - byteWordSize, wordSize))
    }

    return words;
}

const getSubKeyInitializers = (rounds, wordSize) => {
    const size = 2 * rounds + 2;
    const subKeyInitializers = new Array(size);

    const P = PQ[wordSize].P;
    const Q = PQ[wordSize].Q;
    const toInteger = ofSize(wordSize);

    subKeyInitializers[0] = P;

    for (let i = 1; i < size; i++) {
        subKeyInitializers[i] = toInteger(subKeyInitializers[i - 1] + Q)
    }

    return subKeyInitializers;
}

const mixSubKeys = (keyWords, subKeyInitializers, wordSize) => {
    const S = [...keyWords];
    const L = [...subKeyInitializers];
    const c = keyWords.length;
    const t = subKeyInitializers.length;
    let A = 0;
    let B = 0;
    let i = 0;
    let j = 0;

    const rotator = bitwiseRotation(wordSize);
    const toInteger = ofSize(wordSize);

    for (let k = 0; k < 3 * Math.max(c, t); k++) {
        A = S[i] = toInteger(rotator.rol(toInteger(toInteger(S[i] + A) + B), 3));
        B = L[j] = toInteger(rotator.rol(toInteger(toInteger(L[j] + A) + B), toInteger(A + B)));
        i = (i + 1) % t;
        j = (j + 1) % c;
    }

    return S;
}

const toSubKeys = (key, rounds, wordSize) => {
    const keyWords = toWords(key, wordSize);
    const subKeyInitializers = getSubKeyInitializers(rounds, wordSize);

    return mixSubKeys(keyWords, subKeyInitializers, wordSize);
}

module.exports = toSubKeys;