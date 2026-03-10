const express = require('express');
const app = express();
const mongoose = require("mongoose");
const connectDB = require("./config/database")
const User = require("./models/user")

app.use(express.json());
app.post("/signup",async (req,res) => {
    console.log(req.body);
    const user = new User(req.body); 
    try{
    await user.save();
    res.send("User added successfully")
    }
    
    catch(err){
        res.status(400).send("Error saving the user" + err.message)
    }

});
 
// Get user by email
app.get("/user",async (req,res) => {
  const userEmail = req.body.emailId;

  try{
  const user = await User.findOne({emailId: userEmail});
  if(!user){
    res.status(404).send("User not found");
  } else {
    res.send(user);
  }
  }

  catch (err) {
    res.status(400).send("something went wrong")
  }

})
// Feed API - GET /feed - get all the users from the database
app.get("/feed",async (req,res) => {

  try{
    const users = await User.find({});

    res.send(users)
  }

  catch (err) {
    res.status(400).send("something went wrong")
  }
})

app.get("/userId", async (req,res) => {
  const userId = req.body._id;
  try{
    const user = await User.findById({_id : userId})
    if(!user){
    res.status(404).send("User not found");
  } else {
    res.send(user);
  }
  }
  catch(err){
    console.log("something went wrong" + err.message)
  }
})

app.delete("/user", async(req,res) => {
  const userId = req.body._id;
  try{
    const users = await User.findByIdAndDelete({_id : userId})

    res.send("User deleted successfully");
  }

  catch(err){
    res.status(400).send("Something went wrong");
  }
})

// Update data of the user
app.patch("/user", async(req,res) => {
  const userId = req.body._id;
  const data = req.body;
  try{
    await User.findByIdAndUpdate({_id:userId},data,{
      runValidators: true, 
    });
    res.send("User updated successfully");
    
  }
  catch(err){
    res.status(400).send("Update failed:"+err.message);
  }
});

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

