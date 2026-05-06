const socket = require ("socket.io");
const initializeSocket = (server) =>{
  const io = socket(server,{
    cors:{
      origin: "http://localhost:5173",
      credentials: true
    }
  })

  io.on("connection",(socket)=>{
    // Handle Events
    socket.on("joinChat",({userId,targetUserId})=>{
      const roomId = [userId,targetUserId].sort().join("_");
      console.log("Joining Room: "+ roomId);
      socket.join(roomId);
    });

    socket.on("sendmessage",({
      firstName, userId, targetUserId,text:newMessage
    })=>{
      const roomId = [userId,targetUserId].sort().join("_");
    
      io.to(roomId).emit("messageReceived",{
        firstName,
        text:newMessage,
        senderId:userId
      })
      console.log();
    });
  })
}

module.exports = initializeSocket;