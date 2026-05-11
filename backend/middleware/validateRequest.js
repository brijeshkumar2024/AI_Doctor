import { validationResult } from "express-validator";

const validateRequest = (req, _res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const details = errors.array().map(({ msg, path, location }) => ({
      message: msg,
      field: path,
      location
    }));
    const error = new Error(details[0].message);
    error.statusCode = 400;
    error.details = details;
    return next(error);
  }

  return next();
};

export default validateRequest;
