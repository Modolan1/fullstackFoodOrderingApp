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

export { AppError, getErrorStatusCode }
