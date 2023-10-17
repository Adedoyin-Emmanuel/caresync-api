import config from "config";
import { rateLimit } from "express-rate-limit";

const defaultMessage = {
  code: 429,
  status: "Too many requests",
  message: "Too many requests chief, try again later",
  data: {},
};

const useRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: config.get("App.request-limit"),
  message: defaultMessage,
});

export const useLoginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: config.get("App.login-request-limit"),
  message: defaultMessage,
});

export const useCreateUserLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: config.get("App.login-request-limit"),
  message: defaultMessage,
});

export const useVerifyLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: config.get("App.verify-user-request-limit"),
  message: defaultMessage,
});

export default useRateLimiter;
