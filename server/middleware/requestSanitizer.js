const dangerousKeys = new Set([
  "$where",
  "$gt",
  "$gte",
  "$lt",
  "$lte",
  "$ne",
  "$in",
  "$nin",
  "$regex",
  "$or",
  "$and",
  "$expr",
]);

function sanitizeValue(value) {
  if (Array.isArray(value)) return value.map(sanitizeValue);

  if (value && typeof value === "object") {
    return Object.entries(value).reduce((result, [key, child]) => {
      if (key.startsWith("$") || key.includes(".")) return result;
      result[key] = sanitizeValue(child);
      return result;
    }, {});
  }

  if (typeof value === "string") {
    return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
  }

  return value;
}

module.exports = function requestSanitizer(req, res, next) {
  if (req.body && typeof req.body === "object") req.body = sanitizeValue(req.body);
  if (req.query && typeof req.query === "object") req.query = sanitizeValue(req.query);
  if (req.params && typeof req.params === "object") req.params = sanitizeValue(req.params);
  next();
};

module.exports.dangerousKeys = dangerousKeys;
