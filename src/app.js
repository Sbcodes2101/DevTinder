const express = require('express');
const app = express();
const mongoose = require("mongoose");
const connectDB = require("./config/database")
const User = require("./models/user")

app.use(express.json());
app.post("/signup",async (req,res) => {
    console.log(req.body);
    const user = new User(req.body); 
    // const user = new User ({
    //     firstName : "Sarthak",
    //     lastName : "Bahuguna",
    //     emailId: "sarthakbahuguna2101@gmail.com",
    //     password: "sar2345"
    // })

    // // Creating a new instance of the User model
    try{
    await user.save();
    res.send("User added successfully")
    }
    
    catch(err){
        res.status(400).send("Error saving the user" + err.message)
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

