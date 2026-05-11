class AppError extends Error {
  constructor(message, statusCode = 500, errorCode = "INTERNAL_ERROR", details = undefined) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
  }
}

export default AppError;
