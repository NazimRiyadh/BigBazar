export const catchAsyncErrors = (asyncHandler) => {
  return (req, res, next) => {
    Promise.resolve(asyncHandler(req, res, next)).catch(next);
  };
};
