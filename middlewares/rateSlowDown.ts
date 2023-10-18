import SlowDown from "express-slow-down";

export const useLoginSlowDown = SlowDown({
  windowMs: 15 * 60 * 1000,
  delayAfter: 3,
  delayMs: 1000,
});

export const useVerifySlowDown = SlowDown({
  windowMs: 60 * 60 * 1000,
  delayAfter: 3,
  delayMs: 1000,
});
