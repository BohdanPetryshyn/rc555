const bitwiseRotation = require('bitwise-rotation').default;

const readWord = require('./readWord');
const wrap = require('../../math/wrap');

const PQ = {
  16: {
    P: 0xb7e1,
    Q: 0x9e37,
  },
  32: {
    P: 0xb7e15163,
    Q: 0x9e3779b9,
  },
};

const completeKey = (key, wordSize) => {
  const byteWordSize = wordSize / 8;
  const keyIncompleteness = byteWordSize - (key.length % byteWordSize);

  return keyIncompleteness === 0
    ? key
    : Buffer.concat([key, Buffer.alloc(keyIncompleteness)]);
};

const toWords = (key, wordSize) => {
  const byteWordSize = wordSize / 8;
  const completedKey = completeKey(key, wordSize);
  const size = completedKey.length / byteWordSize;
  const words = new Array(size);

  for (let i = 0; i < size; i++) {
    const position = i * byteWordSize;
    words[i] = readWord(completedKey, position, wordSize);
  }

  return words;
};

const getSubKeyInitializers = (rounds, wordSize) => {
  const size = 2 * rounds + 2;
  const subKeyInitializers = new Array(size);

  const P = PQ[wordSize].P;
  const Q = PQ[wordSize].Q;

  subKeyInitializers[0] = P;

  for (let i = 1; i < size; i++) {
    subKeyInitializers[i] = wrap(subKeyInitializers[i - 1] + Q, wordSize);
  }

  return subKeyInitializers;
};

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

  for (let k = 0; k < 3 * Math.max(c, t); k++) {
    A = S[i] = rotator.rol(wrap(S[i] + A + B, wordSize), 3);
    B = L[j] = rotator.rol(wrap(L[j] + A + B, wordSize), wrap(A + B, wordSize));
    i = (i + 1) % t;
    j = (j + 1) % c;
  }

  return S;
};

const toSubKeys = (key, rounds, wordSize) => {
  const keyWords = toWords(key, wordSize);
  const subKeyInitializers = getSubKeyInitializers(rounds, wordSize);
  return mixSubKeys(keyWords, subKeyInitializers, wordSize);
};

module.exports = toSubKeys;
