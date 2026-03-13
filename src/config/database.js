const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://sarthakbahuguna7269:wcmmrktF38a842DG@devtinder.xkjadcm.mongodb.net/?appName=DevTinder"
  );
};

module.exports = connectDB;
