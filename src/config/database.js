const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://sarthakbahuguna7269:4TrzI9V0BdapKCKk@devtinder.xkjadcm.mongodb.net/",
  );
};

module.exports = connectDB;
