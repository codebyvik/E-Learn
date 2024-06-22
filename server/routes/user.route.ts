import express from "express";
import {
  activateUser,
  getUserInfo,
  logoutUser,
  registerUser,
  signInUser,
  socialAuth,
  updateAccessToken,
  updateAvatar,
  updateUserInfo,
  updateUserPassword,
} from "../controllers/user.controller";
import { isAuthenticated } from "../middleware/auth";
const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/activate", activateUser);
userRouter.post("/signin", signInUser);
userRouter.get("/logout", isAuthenticated, logoutUser);
userRouter.get("/refreshtoken", updateAccessToken);
userRouter.get("/me", isAuthenticated, getUserInfo);
userRouter.post("/social-auth", socialAuth);
userRouter.put("/update-user", isAuthenticated, updateUserInfo);
userRouter.put("/update-password", isAuthenticated, updateUserPassword);
userRouter.put("/update-avatar", isAuthenticated, updateAvatar);

export default userRouter;
