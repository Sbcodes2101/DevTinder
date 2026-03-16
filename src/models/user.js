const mongoose = require('mongoose');
const validator = require("validator")
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt"); 

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String
    },
    emailId: {
        type: String,
        required: true,
        unique: true,
        lowercase:true,
        trim:true,
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
        type: Number ,
        min: 18
    },
    gender: {
        type: String,
        validate(value){
            if(!["male","female","others"].includes(value)){
                throw new Error("gender daa is not valid");
            }
        }
    },
    photoUrl: {
        type: String,
        validate(value){
            if(!validator.isURL(value)){
                throw new Error ("Invalid photo url: " + value);
            }
        }
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


userSchema.methods.getJWT = async function () {
    const user = this;
    const token = await jwt.sign({_id: user._id}, "devTINDER@123",{
        expiresIn: "7d"
      })
    return token;
}


userSchema.methods.getPassword = async function (passwordInputByUser) 
{
    const user = this;
    const passwordHash =user.password
    const ispasswordValid = await bcrypt.compare(passwordInputByUser,passwordHash)
    return ispasswordValid;
}

const userModel = mongoose.model("User",userSchema);

module.exports = userModel;
