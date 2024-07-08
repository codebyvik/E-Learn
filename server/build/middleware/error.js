"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = void 0;
const errorHandler_1 = __importDefault(require("../utils/errorHandler"));
const errorMiddleware = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal server error";
    // Wrong mongoDB ID error
    if (err.name === "CastError") {
        const message = `Resourse not found. Invalid ${err.path}`;
        err = new errorHandler_1.default(message, 400);
    }
    //   Duplicate key error
    if (err.code === 11000) {
        const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
        err = new errorHandler_1.default(message, 400);
    }
    //   Wrong JWT token error
    if (err.name === "JsonWebTokenError") {
        const message = `Json Web Token is invalid , try again`;
        err = new errorHandler_1.default(message, 400);
    }
    //    JWT token expired error
    if (err.name === "TokenExpiredError") {
        const message = `Json Web Token is expired , try again`;
        err = new errorHandler_1.default(message, 400);
    }
    res.status(err.statusCode).json({
        success: false,
        message: err.message,
    });
};
exports.errorMiddleware = errorMiddleware;
