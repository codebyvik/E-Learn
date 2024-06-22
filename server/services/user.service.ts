import { Response } from "express";
// import userModel from "../models/user.model";
import { redis } from "../utils/redis";

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
