const express = require('express');
const app = express();
const { adminauth,userAuth } = require('../middlewares/auth');

// This will only handle GET call to /user
// app.use("/user",(req,res,next)=>{
//     console.log("Handling the router user!!");
//     res.send("Response!!");
//     next();
// },(req,res)=>{
//     console.log("Handling the router user 2!!");
//     res.send("Response 2!!");
// })

// app.get("/user",(req,res,next)=>{
//     // these act as a middleware
//     console.log("handling the route user 1");
//     next();
// })

// app.get("/user",(req,res,next)=>{
//     console.log("handling the route user 2");
//     res.send("user 2!!")
// })
    app.use("/admin",adminauth); 

    app.get("/user",userAuth,(req,res)=>{
        res.send("user data sent")
    })
    app.get("/admin/getAllData",(req,res)=>{
        // check if the request is authenticated-->this will be needed again and again
        res.send("All Data sent");
    })

    app.get("/admin/deleteUser",(req,res)=>{
        res.send("Delete a user");
    })


app.listen(7777,()=>{
    console.log("Server is listening on port 7777");
})