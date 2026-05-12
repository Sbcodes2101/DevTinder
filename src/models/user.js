const mongoose = require('mongoose');            
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt"); 

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },

    lastName: {
        type: String,
        required:true,
    },
    
    emailId: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error ("Invalid email address: " + value);
            }
        }
    },

    password: {
        type: String,
        required: true
    },

    age: {
        type: Number,
        min: 18
    },

    gender: {
        type: String,
        validate(value){
            if(!["male","female","others"].includes(value)){
                throw new Error("gender data is not valid");
            }
        }
    },

    photoUrl: {
        type: String,
        validate(value){
            if(!validator.isURL(value)){
                throw new Error ("Invalid photo url: " + value);
            }
        },
        default: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSBRA2TmZWxhMbzalqzdjW_zZJBp7U3ZdE--w&s"
    },

    about: {
        type: String,
        default: "This is a default about of the user!"
    },

    skills: {
        type: [String],
    }

},{
    timestamps: true
});


userSchema.methods.getJWT = async function(){
    const user = this;
    const token = await jwt.sign(
        {user: user._id},
        "devTINDER@123",
        {expiresIn: "7d"}
    )
    return token;
}


userSchema.methods.getPassword = async function (passwordInputByUser) {
    const user = this;                        // 'this' = current user document
    const passwordHash = user.password;       // hashed password from DB
    const isPasswordValid = await bcrypt.compare(
        passwordInputByUser,                  // what user typed
        passwordHash                          // what's stored in DB
    )
    return isPasswordValid; // true or false
}

const userModel = mongoose.model("User",userSchema);

module.exports = userModel;
