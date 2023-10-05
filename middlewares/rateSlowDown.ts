import slowDown from "express-slow-down";

export const loginSlowDown = slowDown({
  windowMs: 15 * 60 * 1000,
  delayAfter: 3,
  delayMs: 1000,
});
