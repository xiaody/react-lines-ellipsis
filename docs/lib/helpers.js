function omit(obj, omittedKeys) {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  var ret = {};
  Object.keys(obj).forEach(function (key) {
    if (omittedKeys.indexOf(key) > -1) {
      return;
    }

    ret[key] = obj[key];
  });
  return ret;
}

exports.omit = omit;
