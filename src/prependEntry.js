function prependEntry(entry, moduleToPrepend) {
  if (typeof entry === 'string') {
    return [moduleToPrepend, entry];
  } else if (Array.isArray(entry)) {
    return [moduleToPrepend, ...entry];
  } else if (typeof entry === 'function') {
    return (...args) => {
      return prependEntry(entry(...args), moduleToPrepend);
    };
  }

  const newEntry = {};

  Object.keys(entry).forEach((key) => {
    newEntry[key] = prependEntry(entry[key], moduleToPrepend);
  });

  return newEntry;
}

module.exports = prependEntry;
