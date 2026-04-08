const express = require('express');
const app = express();
const connectDB = require("./config/database")

const cookieParser = require("cookie-parser");
const {userAuth} = require("./middlewares/auth")
const cors = require("cors")

  app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
  }
)
);

app.use(express.json());
app.use(cookieParser());


const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/requests")
const userRouter = require("./routes/user")


app.use("/",authRouter)
app.use("/",profileRouter)
app.use("/",requestRouter)
app.use("/",userRouter)
app.post("/sendConnectionRequest",userAuth, async(req,res) => {
  try{const user = req.user
  console.log("Sending a connection request");

  res.send(user.firstName + "Connection Request Sent!")}
  catch(err){
    res.send("ERROR:")
  }
})



connectDB()
  .then(() => {
    console.log("Database connection established...");

    app.listen(7777,()=>{
    console.log("Server is listening on port 7777");
})
  })
  .catch((err) => {
    console.error("Database cannot be connected!!");
  }); 

