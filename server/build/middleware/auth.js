"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRoles = exports.isAuthenticated = void 0;
const catchAsyncError_1 = __importDefault(require("./catchAsyncError"));
const errorHandler_1 = __importDefault(require("../utils/errorHandler"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const redis_1 = require("../utils/redis");
require("dotenv").config();
exports.isAuthenticated = (0, catchAsyncError_1.default)(async (req, res, next) => {
    const access_token = req.cookies.access_token;
    if (!access_token) {
        return next(new errorHandler_1.default("Please login to access this resource", 400));
    }
    const decodedToken = await jsonwebtoken_1.default.verify(access_token, process.env.ACCESS_TOKEN);
    if (!decodedToken) {
        return next(new errorHandler_1.default("Access token is not valid", 400));
    }
    const user = await redis_1.redis.get(decodedToken.id);
    if (!user) {
        return next(new errorHandler_1.default("Please login to access this resourse", 400));
    }
    req.user = JSON.parse(user);
    next();
});
// validate user role
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user?.role || "")) {
            return next(new errorHandler_1.default(`Role: ${req.user?.role} is not allowed to access this resourse`, 403));
        }
        next();
    };
};
exports.authorizeRoles = authorizeRoles;
