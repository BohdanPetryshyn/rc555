const readWord = (buffer, position, wordSize) => {
    switch (wordSize) {
        case 16:
            return buffer.readUInt16LE(position);
        case 32:
            return buffer.readUInt32LE(position);
    }
}

module.exports = readWord;