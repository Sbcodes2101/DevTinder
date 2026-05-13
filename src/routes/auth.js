const express = require('express')
const authRouter = express.Router();
const User = require("../models/user")
const {validateSignUpData} = require("../utils/validation")
const bcrypt = require("bcrypt");

authRouter.post("/signup",async (req,res) => {
  try{
  // validation of data
  validateSignUpData(req);
  // Encrypt the password
  const {firstName,lastName,emailId,password,age,gender} = req.body;
  const passwordHash = await bcrypt.hash(password,10)
  console.log(passwordHash)


  // creating a new instance of the User Model
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
      age: age,
      gender: gender
    }); 


    const savedUser = await user.save();

    const token = await user.getJWT()
      // Add the token to cookie and send the response back to the user
      res.cookie("token", token,{
        expires:new Date(Date.now()+8*3600000),
      });

      res.json({message: "User Added successfully",data: savedUser});
      res.send(user);
      res.send("User added successfully")
    
    }
    catch(err){
        res.status(400).send("ERROR" + err.message)
    }
});  
 
// Get user by email
authRouter.post("/Login", async(req,res) => {
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
      res.send(user);
    }
    
    else{
      throw new Error("Invalid credentials");
    }
  }

  catch(err){
    res.status(400).send("ERROR : "+err.message)
  }
});

authRouter.post("/logout", async (req, res) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
    });
    res.send("Logout Successful");
});

module.exports = authRouter


//   try{
//   // validation of data
//   validateSignUpData(req);
//   // Encrypt the password
//   const {firstName,lastName,emailId,password,age,gender} = req.body;
//   const passwordHash = await bcrypt.hash(password,10)
//   console.log(passwordHash)


//   // creating a new instance of the User Model
//     const user = new User({
//       firstName,
//       lastName,
//       emailId,
//       password: passwordHash,
//       age: age,
//       gender: gender
//     }); 


//     const savedUser = await user.save();

//     const token = await user.getJWT()
//       // Add the token to cookie and send the response back to the user
//       res.cookie("token", token,{
//         expires:new Date(Date.now()+8*3600000),
//       });

//       res.json({message: "User Added successfully",data: savedUser});
//       res.send(user);
//       res.send("User added successfully")
    
//     }
//     catch(err){
//         res.status(400).send("ERROR" + err.message)
//     }
// });