import { Response } from "express";
// import userModel from "../models/user.model";
import { redis } from "../utils/redis";
import userModel from "../models/user.model";

// get single user by ID
export const getUserByID = async (id: string, res: Response) => {
  const userJSON = await redis.get(id);

  if (userJSON) {
    const user = JSON.parse(userJSON);
    res.status(201).json({
      success: true,
      user,
    });
  }
};

// get all users
export const getAllUsersService = async (res: Response) => {
  const user = await userModel.find().sort({ createdAt: -1 });

  res.status(201).json({
    success: true,
    user,
  });
};

// update user role service
export const updateUserRoleService = async (res: Response, id: string, role: string) => {
  const user = await userModel.findByIdAndUpdate(id, { role });

  res.status(201).json({
    success: true,
    user,
  });
};
