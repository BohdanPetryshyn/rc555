const wrap = (number, wordSize) => {
    return number % (2 ** wordSize);
};

module.exports = wrap;