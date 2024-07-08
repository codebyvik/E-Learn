import { Server as SocketIoServer } from "socket.io";
import http from "http";

export const initSocketIoSever = (server: http.Server) => {
  const io = new SocketIoServer(server);

  io.on("connection", (socket) => {
    console.log("A user connected");

    // Listen for 'notification' event from the frontend
    socket.on("notification", (data: any) => {
      // Broadcast the notification data to all connected clients (admin dashboard)
      io.emit("newNotification", data);
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected");
    });
  });
};
