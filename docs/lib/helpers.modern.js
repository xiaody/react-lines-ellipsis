function omit(obj, omittedKeys) {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  const ret = {};
  Object.keys(obj).forEach(key => {
    if (omittedKeys.indexOf(key) > -1) {
      return;
    }

    ret[key] = obj[key];
  });
  return ret;
}

export { omit };
