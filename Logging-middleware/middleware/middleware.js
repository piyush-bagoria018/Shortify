import { Log } from "../utils/logger.js";

export const logMiddleware = async (req, res, next) => {
  await Log("backend", "info", "route", `Received ${req.method} ${req.originalUrl}`);
  next();
}