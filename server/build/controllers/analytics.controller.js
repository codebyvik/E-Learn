"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCoursesAnalytics = exports.getOrdersAnalytics = exports.getUsersAnalytics = void 0;
const catchAsyncError_1 = __importDefault(require("../middleware/catchAsyncError"));
const errorHandler_1 = __importDefault(require("../utils/errorHandler"));
const analytics_generator_1 = require("../utils/analytics.generator");
const user_model_1 = __importDefault(require("../models/user.model"));
const order_model_1 = __importDefault(require("../models/order.model"));
const course_model_1 = __importDefault(require("../models/course.model"));
// get user analytics --admin
exports.getUsersAnalytics = (0, catchAsyncError_1.default)(async (req, res, next) => {
    try {
        const users = await (0, analytics_generator_1.generateOneYearData)(user_model_1.default);
        res.status(200).json({
            success: true,
            users,
        });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
});
// get orders analytics --admin
exports.getOrdersAnalytics = (0, catchAsyncError_1.default)(async (req, res, next) => {
    try {
        const orders = await (0, analytics_generator_1.generateOneYearData)(order_model_1.default);
        res.status(200).json({
            success: true,
            orders,
        });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
});
// get courses analytics --admin
exports.getCoursesAnalytics = (0, catchAsyncError_1.default)(async (req, res, next) => {
    try {
        const courses = await (0, analytics_generator_1.generateOneYearData)(course_model_1.default);
        res.status(200).json({
            success: true,
            courses,
        });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
});
