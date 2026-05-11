const validateZod = (schema, selector = "body") => (req, _res, next) => {
  try {
    req[selector] = schema.parse(req[selector]);
    next();
  } catch (error) {
    const firstIssue = error.issues?.[0];
    const validationError = new Error(firstIssue?.message || "Validation failed");
    validationError.statusCode = 400;
    validationError.details = error.issues?.map((issue) => ({
      message: issue.message,
      field: issue.path?.join(".") || selector,
      code: issue.code
    }));
    next(validationError);
  }
};

export default validateZod;
