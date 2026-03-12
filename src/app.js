const express = require('express');
const app = express();
const mongoose = require("mongoose");
const connectDB = require("./config/database")
const User = require("./models/user")
const {validateSignUpData} = require("./utils/validation")
const bcrypt = require("bcrypt"); 
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken")
const {userAuth} = require("./middlewares/auth")



app.use(express.json());
app.use(cookieParser());

app.post("/signup",async (req,res) => {
  try{
  // validation of data
  validateSignUpData(req);
  // Encrypt the password
  const {firstName,lastName,emailId,password} = req.body;

  const passwordHash = await bcrypt.hash(password,10)
  console.log(passwordHash)
  // creating a new instance of the User Model
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
    }); 
    
    await user.save();
    res.send("User added successfully")
    }
    
    catch(err){
        res.status(400).send("ERROR" + err.message)
    }

});
 
// Get user by email
app.post("/Login", async(req,res) => {
  try{
    const {emailId,password} = req.body;
    
    const user = await User.findOne({emailId : emailId});

    if(!user){
      throw new Error("Invalid credentials")
    }
    const isPasswordValid = await user.getPassword(password)

    if(isPasswordValid){
      // Create a JWT token
      const token = await user.getJWT()
      // Add the token to cookie and send the response back to the user
      res.cookie("token", token);

      res.send("Login successful!");
    }

    else{
      throw new Error("Invalid credentials");
    }
  }
  catch(err){
    res.status(400).send("ERROR : "+err.message)
  }
});

// Update data of the user
app.get("/profile", userAuth, async(req,res) => {
  try{
  const user = req.user;
  res.send(user)
}
catch(err){
    res.status(400).send("ERROR : "+err.message)
  }
})

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

