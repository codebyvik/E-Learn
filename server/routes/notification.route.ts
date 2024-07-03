import express from "express";

import { authorizeRoles, isAuthenticated } from "../middleware/auth";

import { getAllNotifications, updateNotifications } from "../controllers/notification.controller";
import { updateAccessToken } from "../controllers/user.controller";

const notificationRouter = express.Router();

notificationRouter.get(
  "/get-all-notifications",
  updateAccessToken,
  isAuthenticated,
  authorizeRoles("admin"),
  getAllNotifications
);
notificationRouter.put(
  "/update-notifications/:id",
  updateAccessToken,
  isAuthenticated,
  authorizeRoles("admin"),
  updateNotifications
);

export default notificationRouter;
