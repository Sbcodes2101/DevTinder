const express = require('express');
const app = express();

// This will only handle GET call to /user
app.get("/user",(req,res) => {
    res.send({firstName :"Sarthak", lastName: "Bahuguna"})
})

app.post("/user",async (req,res)=>{
    console.log(req.body)
    res.send("Save data to the database!");
});

app.delete("/user",(req,res)=>{
    res.send("Deleted successfully!")
})

app.use("/test",(req,res)=>{
    res.send("Hello from the server!");
}) 

app.listen(7777,()=>{
    console.log("Server is listening on port 7777");
})