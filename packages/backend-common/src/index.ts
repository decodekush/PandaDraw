export const JWT_SECRET = process.env.JWT_SECRET || "123123";
export const AUTH_BYPASS_ENABLED =
  process.env.AUTH_BYPASS === "true" || process.env.NODE_ENV !== "production";
export const DEV_BYPASS_USER_ID =
  process.env.DEV_BYPASS_USER_ID || "dev-bypass-user";
export const DEV_BYPASS_EMAIL =
  process.env.DEV_BYPASS_EMAIL || "dev-bypass@pandadraw.local";
