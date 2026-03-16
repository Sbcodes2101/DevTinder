const express = require("express")
const profileRouter = express.Router();
const {userAuth} = require("../middlewares/auth")
const {validateEditProfileData} = require("../utils/validation")
const {validateNewPassword} = require("../utils/validation")
profileRouter.get("/profile/view", userAuth, async(req,res) => {
  try{
  const user = req.user;
  res.send(user)
}
catch(err){
    res.status(400).send("ERROR : "+err.message)
  }
})

profileRouter.patch("/profile/edit",userAuth,async(req,res) => {
  try{
    if(!validateEditProfileData(req)){
      throw new Error("Invalid Edit Request")
    }
    const loggedInUser = req.user;

    Object.keys(req.body).forEach((key) => (loggedInUser[key] = req.body[key] ));

    console.log(loggedInUser)

    await loggedInUser.save();

    res.send(`${loggedInUser.firstName} ,Profile updated successfully`);

  } catch(err) {
    res.status(400).send("ERROR: "+err.message);
  }
})

profileRouter.patch("/profile/password",userAuth,async(req,res)=>{
    try{
    const {oldPassword,newPassword} = req.body;
    const user = req.user;
    const previousPassword = user.password;

    validateNewPassword(newPassword);

      if(oldPassword === newPassword){
        throw new Error("Please enter a different password than previous password")
      }

      if(await bcrypt.compare(oldPassword,previousPassword)){
          const hashPassword = await bcrypt.hash(newPassword,10);
          user.password = hashPassword;
          await user.save();
          return res.send("Password updated successfully")
      }
      else{
        res.status(400).send("password incorrect")
      }
    }catch(err){
      res.status(400).send("ERROR: " + err.message)
    }
})

module.exports = profileRouter