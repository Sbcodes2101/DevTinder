const { text } = require("express");
const socket = require ("socket.io");
const initializeSocket = (server) =>{

  const io = socket(server,{
    cors:{
      origin:"http://localhost:5173",
      credentials:true
    }
  })

  io.on("connection",(socket)=>{
    // Handle Events
    socket.on("joinChat",({firstName,userId,targetUserId})=>{
      const roomId = [userId,targetUserId].sort().join("_");
      console.log(firstName + ": Sending message to Room: " + roomId);
      socket.join(roomId);
    });

    socket.on("sendMessage",({
      firstName,userId,targetUserId,text:newMessage
    }) => {
      const roomId = [userId,targetUserId].sort().join("_"); 
      console.log(firstName +" "+newMessage);
      io.to(roomId).emit("messageReceived",{firstName,text:newMessage});
    })

    socket.on("disconnect",()=>{});
  })
}

module.exports = initializeSocket;