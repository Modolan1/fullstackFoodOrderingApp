class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message)
    this.name = 'AppError'
    this.statusCode = statusCode
  }
}

const getErrorStatusCode = (error) => {
  if (error instanceof AppError) {
    return error.statusCode
  }

  return 500
}

/**
 * Wraps an async Express route handler and forwards any thrown errors
 * to the Express global error handler via next(), eliminating repetitive
 * try/catch boilerplate in every controller.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

export { AppError, asyncHandler, getErrorStatusCode }
