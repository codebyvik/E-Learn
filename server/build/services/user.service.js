"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserRoleService = exports.getAllUsersService = exports.getUserByID = void 0;
// import userModel from "../models/user.model";
const redis_1 = require("../utils/redis");
const user_model_1 = __importDefault(require("../models/user.model"));
// get single user by ID
const getUserByID = async (id, res) => {
    const userJSON = await redis_1.redis.get(id);
    if (userJSON) {
        const user = JSON.parse(userJSON);
        res.status(201).json({
            success: true,
            user,
        });
    }
};
exports.getUserByID = getUserByID;
// get all users
const getAllUsersService = async (res) => {
    const users = await user_model_1.default.find().sort({ createdAt: -1 });
    res.status(201).json({
        success: true,
        users,
    });
};
exports.getAllUsersService = getAllUsersService;
// update user role service
const updateUserRoleService = async (res, id, role) => {
    const user = await user_model_1.default.findByIdAndUpdate(id, { role });
    res.status(201).json({
        success: true,
        user,
    });
};
exports.updateUserRoleService = updateUserRoleService;
