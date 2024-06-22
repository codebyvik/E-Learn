import express from "express";
import { activateUser, logoutUser, registerUser, signInUser } from "../controllers/user.controller";
import { isAuthenticated } from "../middleware/auth";
const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/activate", activateUser);
userRouter.post("/signin", signInUser);
userRouter.get("/logout", isAuthenticated, logoutUser);

export default userRouter;
