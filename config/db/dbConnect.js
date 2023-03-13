const mongoose = require("mongoose");
const dbConnect = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI,
      {
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
        useNewUrlParser: true,
      }
    );
    console.log("DB is connected");
  } catch (error) {
    console.log(`Error ${error.message}`);
  }
};
module.exports = dbConnect;
