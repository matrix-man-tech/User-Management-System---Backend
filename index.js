const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
dotenv.config();
const dbConnect = require("./config/db/dbConnect");
const userRoutes = require("./route/users/usersRoute");
const { errorHandler, notFound } = require("./middlewares/error/errorHandler");

const app = express();



//db
dbConnect();

//middleware
app.use(express.json());

// cors
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
  cors({
    origin: ["http://localhost:3001"],
  })
);

//users route
app.use("/api", userRoutes);


//error handler
app.use(notFound);
app.use(errorHandler);
//server
const PORT = process.env.PORT || 5000;
app.listen(PORT, console.log(`server is running on port: ${PORT}`));
