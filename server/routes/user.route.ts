import express from "express";
import { activateUser, logoutUser, registerUser, signInUser } from "../controllers/user.controller";
const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/activate", activateUser);
userRouter.post("/signin", signInUser);
userRouter.get("/logout", logoutUser);

export default userRouter;
