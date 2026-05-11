const socket = require("socket.io");
const { Chat } = require("../models/chat");

const initializeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {

    socket.on("joinChat", ({ firstName, userId, targetUserId }) => {
      const roomId = [userId, targetUserId].sort().join("_");
      console.log(firstName + ": Joined Room: " + roomId);
      socket.join(roomId);
    });

    socket.on("sendMessage", async ({ firstName, userId, targetUserId, text: newMessage }) => {
      const roomId = [userId, targetUserId].sort().join("_"); // ✅ moved outside try

      try {
        let chat = await Chat.findOne({            
          participants: { $all: [userId, targetUserId] },
        });

        if (!chat) {
          chat = new Chat({
            participants: [userId, targetUserId],
            messages: [],
          });
        }

        chat.messages.push({
          senderId: userId,
          text: newMessage,                       
        });

        await chat.save();

      } catch (err) {
        console.log(err);
      }

      io.to(roomId).emit("messageReceived", { firstName, text: newMessage });
    });

    socket.on("disconnect", () => {});
  });
};

module.exports = initializeSocket;