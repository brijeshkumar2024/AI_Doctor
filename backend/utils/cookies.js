const baseCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/"
});

export const buildAccessTokenCookieOptions = () => ({
  ...baseCookieOptions(),
  maxAge: 1000 * 60 * 15
});

export const buildRefreshTokenCookieOptions = () => ({
  ...baseCookieOptions(),
  maxAge: 1000 * 60 * 60 * 24 * 7,
  path: "/api/auth/refresh"
});

export const buildClearAuthCookieOptions = () => ({
  ...baseCookieOptions()
});
