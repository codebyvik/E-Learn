import mongoose from "mongoose";
require("dotenv").config();

const dbURL: string = process.env.DB_URL || "";

const connectToDB = async () => {
  try {
    await mongoose.connect(dbURL).then((data: any) => {
      console.log(`Database connected with ${data.connection.host}`);
    });
  } catch (error: any) {
    console.log("Error while connecting to DB :", error.message);
    setTimeout(connectToDB, 5000);
  }
};

export default connectToDB;
