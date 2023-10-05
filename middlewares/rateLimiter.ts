import config from "config";
import { rateLimit } from "express-rate-limit";

const defaultMessage = {
  code: 429,
  status: "Too many requests",
  message: "Too many requests chief, try again later",
  data: {},
};

const rateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: config.get("App.request-limit"),
  message: defaultMessage,
});

export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: config.get("App.login-request-limit"),
  message: defaultMessage,
});

export default rateLimiter;
