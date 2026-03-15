import helmet from "helmet";

const strictHelmet = helmet({
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "same-site" },
  referrerPolicy: { policy: "no-referrer" },
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      objectSrc: ["'none'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      fontSrc: ["'self'", "data:"],
      frameAncestors: ["'none'"],
      formAction: ["'self'"]
    }
  }
});

const swaggerHelmet = helmet({
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "same-site" },
  referrerPolicy: { policy: "no-referrer" },
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      fontSrc: ["'self'", "data:"]
    }
  }
});

const sanitizeValue = (value) => {
  if (typeof value === "string") {
    return value
      .replace(/\0/g, "")
      .replace(/[<>$]/g, "")
      .trim();
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (value && typeof value === "object") {
    return Object.entries(value).reduce((result, [key, nestedValue]) => {
      if (key.startsWith("$") || key.includes(".")) {
        return result;
      }

      result[key] = sanitizeValue(nestedValue);
      return result;
    }, {});
  }

  return value;
};

export const applySecurityHeaders = (req, res, next) => {
  const middleware = req.path.startsWith("/api/docs") ? swaggerHelmet : strictHelmet;
  middleware(req, res, next);
};

export const sanitizeRequest = (req, _res, next) => {
  if (req.body) {
    req.body = sanitizeValue(req.body);
  }

  if (req.query) {
    req.query = sanitizeValue(req.query);
  }

  next();
};
