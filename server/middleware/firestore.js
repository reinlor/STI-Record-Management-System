const { admin } = require("../firebase");
const { isFirestoreUnavailable } = require("./errorHandler");

const DEFAULT_RETRIES = 2;
const RETRYABLE_CODES = new Set([
  4,
  8,
  10,
  13,
  14,
  "aborted",
  "deadline-exceeded",
  "resource-exhausted",
  "unavailable",
  "internal",
]);

function getDb() {
  return admin.firestore();
}

function isRetryable(error) {
  return RETRYABLE_CODES.has(error?.code) || isFirestoreUnavailable(error);
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function withFirestoreRetry(operation, options = {}) {
  const retries = Number.isInteger(options.retries) ? options.retries : DEFAULT_RETRIES;
  let attempt = 0;

  while (true) {
    try {
      return await operation(getDb());
    } catch (error) {
      if (attempt >= retries || !isRetryable(error)) throw error;
      await wait(100 * 2 ** attempt);
      attempt += 1;
    }
  }
}

function firestoreHealthCheck(req, res, next) {
  return withFirestoreRetry((db) => db.collection("_health").doc("server").get(), { retries: 1 })
    .then(() => next())
    .catch(next);
}

module.exports = {
  getDb,
  withFirestoreRetry,
  firestoreHealthCheck,
};
