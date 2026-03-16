const express = require('express');
const requestRouter = express.Router();

const {userAuth} = require("../middlewares/auth")

const User = require("../models/user");  

const ConnectionRequest = require("../models/connectionRequest")

requestRouter.post("/request/send/:status/:toUserId",userAuth, async(req,res)=>{
    try{
        const fromUserId = req.user._id;
        const toUserId = req.params.toUserId;
        const status = req.params.status;

        const ALLOWED_STATUS = ["interested","ignored"]

        if(!ALLOWED_STATUS.includes(status)){
            return res.status(400).send("Invalid Request")
        }

        if(fromUserId.equals(toUserId)){
        throw new Error("You cannot send request to yourself");
        }

        const _touser = await User.findById(toUserId)

        const fromuser = await User.findById(fromUserId)

        if(!_touser){
            throw new Error("User not found!")
        }

        const existingConnectionRequest = await ConnectionRequest.findOne(
          { $or: [
            {fromUserId,toUserId},
            {fromUserId: toUserId,toUserId: fromUserId},
            ],}
        );

        if(existingConnectionRequest){
            throw new Error("Connection Request already exists");
        }

        const connectionRequest = new ConnectionRequest({
            fromUserId,
            toUserId,
            status,
        });

        const data = await connectionRequest.save();

        res.json({
            message: fromuser.firstName+"is "+status+ "in "+_touser.firstName,
            data,
        });

    }
    catch(err){
        res.status(400).send("ERROR: "+err.message);
    }
    

})

module.exports = requestRouter