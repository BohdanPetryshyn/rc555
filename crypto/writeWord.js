const writeWord = (buffer, value, position, wordSize) => {
    switch (wordSize) {
        case 16:
            return buffer.writeUInt16LE(value, position);
        case 32:
            return buffer.writeUInt32LE(value,position);
    }
}

module.exports = writeWord;