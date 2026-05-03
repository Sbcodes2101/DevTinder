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
    socket.on("joinchat",()=>{

    });

    socket.on("sendmessage",()=>{
      
    });
  })
}

module.exports = initializeSocket;