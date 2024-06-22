import { NextFunction, Request, Response } from "express";
import CatchAsyncError from "./catchAsyncError";
import ErrorHandler from "../utils/errorHandler";
import jwt, { Secret } from "jsonwebtoken";
import { redis } from "../utils/redis";
require("dotenv").config();

export const isAuthenticated = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const access_token = req.cookies.access_token as string;
    if (!access_token) {
      return next(new ErrorHandler("Please login to access this resource", 400));
    }

    const decodedToken: any = await jwt.verify(access_token, process.env.ACCESS_TOKEN as Secret);

    if (!decodedToken) {
      return next(new ErrorHandler("Access token is not valid", 400));
    }

    const user = await redis.get(decodedToken.id);

    if (!user) {
      return next(new ErrorHandler("user not found", 400));
    }

    req.user = JSON.parse(user);

    next();
  }
);

// validate user role

export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (roles.includes(req.user?.role || "")) {
      return next(
        new ErrorHandler(`Role: ${req.user?.role} is not alloweed to access this resourse`, 403)
      );
    }
  };
};
