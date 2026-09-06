function isFirestoreUnavailable(error) {
  return Boolean(
    error?.code === 14 ||
    error?.code === "unavailable" ||
    error?.code === "deadline-exceeded" ||
    error?.code === "ETIMEDOUT" ||
    error?.code === "ECONNRESET"
  );
}

function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  const status = Number.isInteger(error?.statusCode)
    ? error.statusCode
    : Number.isInteger(error?.status)
      ? error.status
      : isFirestoreUnavailable(error)
        ? 503
        : 500;

  if (status >= 500) {
    console.error("Request failed:", {
      method: req.method,
      path: req.originalUrl,
      code: error?.code,
      message: error?.message,
    });
  }

  const message = status === 503
    ? "The database is temporarily unavailable. Please try again shortly."
    : status >= 500
      ? "An unexpected server error occurred."
      : error?.message || "Request failed.";

  res.status(status).json({
    error: message,
    status,
    requestId: req.requestId,
  });
}

module.exports = errorHandler;
module.exports.isFirestoreUnavailable = isFirestoreUnavailable;
