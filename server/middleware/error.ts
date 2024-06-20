import { NextFunction, Request, Response } from "express";
import ErrorHandler from "../utils/errorHandler";

export const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal server error";

  // Wrong mongoDB ID error
  if (err.name === "CastError") {
    const message = `Resourse not found. Invalid ${err.path}`;
    err = new ErrorHandler(message, 400);
  }

  //   Duplicate key error
  if (err.code === 11000) {
    const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
    err = new ErrorHandler(message, 400);
  }
  //   Wrong JWT token error
  if (err.name === "JsonWebTokenError") {
    const message = `Json Web Token is invalid , try again`;
    err = new ErrorHandler(message, 400);
  }
  //    JWT token expired error
  if (err.name === "TokenExpiredError") {
    const message = `Json Web Token is expired , try again`;
    err = new ErrorHandler(message, 400);
  }

  res.status(err.statusCode).json({
    success: true,
    message: err.message,
  });
};
