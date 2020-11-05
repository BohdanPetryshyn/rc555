const toChunks = (buffer, size) => {
    if (size <= 0) {
        throw new Error('Size can not be less or equal to 0');
    }

    const result = [];
    let nextPosition = 0;

    while (nextPosition < buffer.length) {
        nextPosition += size;
        result.push(buffer.slice(nextPosition - size, nextPosition));
    }

    return result;
}

module.exports = toChunks;