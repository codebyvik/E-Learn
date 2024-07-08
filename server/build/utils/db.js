"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
require("dotenv").config();
const dbURL = process.env.DB_URL || "";
const connectToDB = async () => {
    try {
        await mongoose_1.default.connect(dbURL).then((data) => {
            console.log(`Database connected with ${data.connection.host}`);
        });
    }
    catch (error) {
        console.log("Error while connecting to DB :", error.message);
        setTimeout(connectToDB, 5000);
    }
};
exports.default = connectToDB;
