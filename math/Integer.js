const UInt16 = number => new Uint16Array([number])[0];
const UInt32 = number => new Uint32Array([number])[0];

const ofSize = size => {
    return {
        16: UInt16,
        32: UInt32,
    }[size];
}

module.exports = {
    ofSize,
    UInt16,
    UInt32,
};