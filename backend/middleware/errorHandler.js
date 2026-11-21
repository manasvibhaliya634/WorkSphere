// Global Error Handler Middleware

const errorHandler = (err, req, res, next) => {
  console.error('[Error Details]:', err.stack || err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'An unexpected error occurred on the server.';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
