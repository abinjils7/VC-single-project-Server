import { Server, Socket } from "socket.io";

const userSocketMap: Record<string, string> = {};

export function registerSocketHandlers(io: Server) {
  io.on("connection", (socket: Socket) => {
    socket.on("register_user", (userId: string) => {
      userSocketMap[userId] = socket.id;
    });

    socket.on("join_chat", (chatId: string) => {
      socket.join(chatId);
    });

    socket.on("send_message", (message: any) => {
      io.to(message.chatId).emit("receive_message", message);
    });

    socket.on("join_notifications", (userId: string) => {
      socket.join(`notifications_${userId}`);
    });

    // WebRTC

    socket.on(
      "call_user",
      (data: { to: string; offer: any; from: string; callerName: string }) => {
        const targetSocketId = userSocketMap[data.to];
        if (targetSocketId) {
          io.to(targetSocketId).emit("incoming_call", {
            from: data.from,
            callerName: data.callerName,
            offer: data.offer,
          });
        }
      },
    );

    // Callee accepts — send answer back to caller
    socket.on("call_accepted", (data: { to: string; answer: any }) => {
      const targetSocketId = userSocketMap[data.to];
      if (targetSocketId) {
        io.to(targetSocketId).emit("call_accepted", {
          answer: data.answer,
        });
      }
    });

    // Callee rejects
    socket.on("call_rejected", (data: { to: string }) => {
      const targetSocketId = userSocketMap[data.to];
      if (targetSocketId) {
        io.to(targetSocketId).emit("call_rejected");
      }
    });

    // ICE candidate exchange
    socket.on("ice_candidate", (data: { to: string; candidate: any }) => {
      const targetSocketId = userSocketMap[data.to];
      if (targetSocketId) {
        io.to(targetSocketId).emit("ice_candidate", {
          candidate: data.candidate,
        });
      }
    });

    // Either side ends the call
    socket.on("end_call", (data: { to: string }) => {
      const targetSocketId = userSocketMap[data.to];
      if (targetSocketId) {
        io.to(targetSocketId).emit("call_ended");
      }
    });

    socket.on("disconnect", () => {
      for (const [userId, sId] of Object.entries(userSocketMap)) {
        if (sId === socket.id) {
          delete userSocketMap[userId];
          break;
        }
      }
    });
  });
}
