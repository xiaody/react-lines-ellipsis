export function omit(obj: unknown, omittedKeys: string[]) {
  if (!obj || typeof obj !== "object") {
    return obj;
  }
  const ret = {};
  Object.keys(obj).forEach((key) => {
    if (omittedKeys.includes(key)) {
      return;
    }
    ret[key] = obj[key];
  });
  return ret;
}
