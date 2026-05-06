const express = require("express");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const { Connection } = require("mongoose");
const User = require("../models/user")
const userRouter = express.Router();


// gete all the pending connection request for the loggedIn User
userRouter.get("/user/requests/received",userAuth, async(req,res)=>{
    try{
        const loggedInUser = req.user;

        const connectionRequests = await ConnectionRequest.find({
            toUserId: loggedInUser._id,
            status: "interested",
        }).populate("fromUserId");

        res.json({
            message: "Data fetched successfully",
            data: connectionRequests,
        })
    }catch{
        res.status(400).send("ERROR :" + err.message)
    }
})

userRouter.get("/user/connections", userAuth, async (req,res) => {
    try{
    const loggedInUser = req.user;
    const connectionRequests = await ConnectionRequest.find({
        $or:[{
            toUserId:loggedInUser,status:"accepted"
        },
        {
            fromUserId:loggedInUser,
            status:"accepted"
        }
    ]
    })
    .populate("fromUserId")
    .populate("toUserId")
    // Akshay=>Elon=>accepted
    // Elon=>Mark=>accepted
    // need to get the info where elon is either the sender or the receiver
    const data=connectionRequests.map((row)=>{
        if(row.fromUserId._id.toString()===loggedInUser._id.toString()){
            return row.toUserId;
        }
        return row.fromUserId
    }
    );
    res.json({data});
    }
    catch(err){
        res.status(400).send({message:err.message});
    }
})

userRouter.get("/feed", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;

        const page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10
        
        limit = limit >50 ?50:limit;


        const skip = (page-1)*limit;

        const connectionRequests = await ConnectionRequest.find({
            $or: [
                { fromUserId: loggedInUser._id },
                { toUserId: loggedInUser._id }
            ]
        }).select("fromUserId toUserId");

        const hideUserFromFeed = new Set();

        connectionRequests.forEach((request) => {
            hideUserFromFeed.add(request.fromUserId.toString());
            hideUserFromFeed.add(request.toUserId.toString());
        });

        // hide yourself
        hideUserFromFeed.add(loggedInUser._id.toString());

        const users = await User.find({
            _id: { $nin: Array.from(hideUserFromFeed) }
        }).select("firstName lastName photoUrl age gender about").skip(skip).limit(limit)

        res.send(users);
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
}); 

module.exports = userRouter;