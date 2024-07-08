import { v2 as cloudinary } from "cloudinary";
import { app } from "./app";
import connectToDB from "./utils/db";
import http from "http";
import { initSocketIoSever } from "./socketServer";
require("dotenv").config();

const server = http.createServer(app);

// cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_SECRET_KEY,
});

initSocketIoSever(server);

// create server
server.listen(process.env.PORT, () => {
  console.log("Server is connected to port ", process.env.PORT);
  connectToDB();
});
