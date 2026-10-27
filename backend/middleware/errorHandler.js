const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    statusCode = 404;
    message = 'Resource not found';
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    statusCode = 400;
    let field = 'Field';
    if (err.keyValue && typeof err.keyValue === 'object') {
      field = Object.keys(err.keyValue)[0] || 'Field';
    } else if (err.keyPattern && typeof err.keyPattern === 'object') {
      field = Object.keys(err.keyPattern)[0] || 'Field';
    }
    message = field.toLowerCase() === 'email'
      ? 'Email is already registered. Please sign in instead.'
      : `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
  }

  // Database connection failure
  if (err.name === 'MongoServerSelectionError' || err.name === 'MongoNetworkError') {
    statusCode = 503;
    message = 'Database service temporarily unavailable. Please try again later.';
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(e => e.message).join(', ');
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
