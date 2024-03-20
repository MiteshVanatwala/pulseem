declare global {
  interface String {
    toValidLPName(value: string): string;
    toLower(value: string): string;
  }
}

// eslint-disable-next-line no-extend-native
String.prototype.toValidLPName = function (value: string) {
  let newVal = value;
  if (!newVal || newVal === '') {
    return '';
  }

  return newVal?.replace(/ /g, '_').replaceAll('.', '_').replaceAll('/', '_').trim();
};

export { }