import useAuth from "./auth";
import useErrorHandler from "./error";
import useNotFound from "./notFound";
import useRateLimiter, { useLoginRateLimiter, useCreateUserLimiter } from "./rateLimiter";
import { useLoginSlowDown } from "./rateSlowDown";
import useCheckRole from "./checkRole";

export {
  useErrorHandler,
  useLoginRateLimiter,
  useLoginSlowDown,
  useNotFound,
  useRateLimiter,
  useCreateUserLimiter,
  useAuth,
  useCheckRole
};
