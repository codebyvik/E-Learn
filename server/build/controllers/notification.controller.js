"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateNotifications = exports.getAllNotifications = void 0;
const catchAsyncError_1 = __importDefault(require("../middleware/catchAsyncError"));
const errorHandler_1 = __importDefault(require("../utils/errorHandler"));
const notification_model_1 = __importDefault(require("../models/notification.model"));
const node_cron_1 = __importDefault(require("node-cron"));
// get all notifications -- Only for admin
exports.getAllNotifications = (0, catchAsyncError_1.default)(async (req, res, next) => {
    try {
        const notifications = await notification_model_1.default.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            notifications,
        });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 500));
    }
});
// update notification status -- only admin
exports.updateNotifications = (0, catchAsyncError_1.default)(async (req, res, next) => {
    try {
        const notification = await notification_model_1.default.findById(req.params.id);
        if (!notification) {
            return next(new errorHandler_1.default("Notification not found", 404));
        }
        if (notification) {
            notification.status = "read";
        }
        await notification.save();
        const notifications = await notification_model_1.default.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            notifications,
        });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 500));
    }
});
// delete read notifications every 30 days
node_cron_1.default.schedule("0 0 0 * * *", async () => {
    const thirtydaysAgo = new Date(Date.now() - 30 * 24 * 60 * 1000);
    await notification_model_1.default.deleteMany({ status: "read", createdAt: { $gt: thirtydaysAgo } });
    console.log("Deleted read notifications");
});
