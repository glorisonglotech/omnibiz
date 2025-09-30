// Async error handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((error) => {
    console.error('Async handler caught error:', error);
    console.error('Route:', req.method, req.originalUrl);
    console.error('Stack:', error.stack);
    next(error);
  });
};

module.exports = asyncHandler;
