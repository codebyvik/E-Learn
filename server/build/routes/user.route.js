"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../controllers/user.controller");
const auth_1 = require("../middleware/auth");
const userRouter = express_1.default.Router();
userRouter.post("/register", user_controller_1.registerUser);
userRouter.post("/activate", user_controller_1.activateUser);
userRouter.post("/signin", user_controller_1.signInUser);
userRouter.get("/logout", auth_1.isAuthenticated, user_controller_1.logoutUser);
userRouter.get("/refreshtoken", user_controller_1.updateAccessToken);
userRouter.get("/me", user_controller_1.updateAccessToken, auth_1.isAuthenticated, user_controller_1.getUserInfo);
userRouter.post("/social-auth", user_controller_1.socialAuth);
userRouter.put("/update-user", user_controller_1.updateAccessToken, auth_1.isAuthenticated, user_controller_1.updateUserInfo);
userRouter.put("/update-password", user_controller_1.updateAccessToken, auth_1.isAuthenticated, user_controller_1.updateUserPassword);
userRouter.put("/update-avatar", user_controller_1.updateAccessToken, auth_1.isAuthenticated, user_controller_1.updateAvatar);
userRouter.get("/get-all-users", user_controller_1.updateAccessToken, auth_1.isAuthenticated, (0, auth_1.authorizeRoles)("admin"), user_controller_1.getAllUsers);
userRouter.put("/update-user-role", user_controller_1.updateAccessToken, auth_1.isAuthenticated, (0, auth_1.authorizeRoles)("admin"), user_controller_1.updateUserRole);
userRouter.delete("/delete-user/:id", user_controller_1.updateAccessToken, auth_1.isAuthenticated, (0, auth_1.authorizeRoles)("admin"), user_controller_1.deleteUser);
exports.default = userRouter;