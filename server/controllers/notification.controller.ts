import { NextFunction, Response, Request } from "express";
import CatchAsyncError from "../middleware/catchAsyncError";
import ErrorHandler from "../utils/errorHandler";
import notificationModel from "../models/notification.model";
import cron from "node-cron";
// get all notifications -- Only for admin
export const getAllNotifications = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const notifications = await notificationModel.find().sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        notifications,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// update notification status -- only admin
export const updateNotifications = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const notification = await notificationModel.findById(req.params.id);

      if (!notification) {
        return next(new ErrorHandler("Notification not found", 404));
      }

      if (notification) {
        notification.status = "read";
      }

      await notification.save();

      const notifications = await notificationModel.find().sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        notifications,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// delete read notifications every 30 days

cron.schedule("0 0 0 * * *", async () => {
  const thirtydaysAgo = new Date(Date.now() - 30 * 24 * 60 * 1000);
  await notificationModel.deleteMany({ status: "read", createdAt: { $gt: thirtydaysAgo } });
  console.log("Deleted read notifications");
});
