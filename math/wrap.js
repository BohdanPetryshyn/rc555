const wrap = (number, wordSize) => {
    switch (wordSize) {
        case 16:
            return new Uint16Array([number])[0];
        case 32:
            return new Uint32Array([number])[0];
    }
};

module.exports = wrap;