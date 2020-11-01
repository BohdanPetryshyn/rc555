const writeWord = (buffer, value, position, wordSize) => {
    switch (wordSize) {
        case 16:
            return buffer.writeUInt16LE(value >>> 0, position);
        case 32:
            return buffer.writeUInt32LE(value >>> 0,position);
    }
}

module.exports = writeWord;