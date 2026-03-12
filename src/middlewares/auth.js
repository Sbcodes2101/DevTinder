const jwt = require('jsonwebtoken')
const User = require("../models/user")
const userAuth = (async(req,res,next) => {
    // Read the token fron the req cookies
    try{
    const {token} = req.cookies;

    const decodeObj = await jwt.verify(token,"devTINDER@123" )
    const {_id} = decodeObj;

    const user = await User.findById(_id);
    // Find the user
    if(!user){
        throw new Error("User not found")
    }

    req.user = user;
    next();
    }

    catch(err){
        res.status(400).send("ERROR :", +err.message)
    }
});

module.exports ={userAuth}
