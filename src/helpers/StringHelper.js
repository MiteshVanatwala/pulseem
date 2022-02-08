export const shortStr = (str, len) => {
    const length = str.length;
    if (length > len) {
        return str.substring(0, len) + '...';
    }
    return str;
}