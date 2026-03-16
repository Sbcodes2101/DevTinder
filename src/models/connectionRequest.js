const mongoose = require('mongoose');

const connectionRequestSchema = new mongoose.Schema({
    fromUserId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    toUserId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    status: {
        type:String,
        enum: {
            values: ["ignore","interested","accepted","rejected"],
            message: `{VALUE} is incorrect status type`,
        }
    },
},
    {
        timestamps: true
    }
);

// Connection
connectionRequestSchema.index({fromUserId: 1,toUserId: 1})c 

connectionRequestSchema.pre("save",function(next){
    const connectionRequest = this;
    // Check if the fromUserId is same as toUserId
    if(connectionRequest.fromUserId.equals(connectionRequest.toUserId)){
        throw new Error("Cannot send connection request to yourself!");
    }
    next();
});

const connectionRequestModel = new mongoose.model(
    "ConnectionRequest",
    connectionRequestSchema
);

module.exports = connectionRequestModel