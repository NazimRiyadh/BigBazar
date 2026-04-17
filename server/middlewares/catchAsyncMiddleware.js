export const catchAsyncMiddleware = (asyncHandler) => {
  return (req, res, next) => {
    Promise.resolve(asyncHandler(req, res, next)).catch(next);
  };
};
