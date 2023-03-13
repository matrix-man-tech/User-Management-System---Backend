const express = require("express");
const {
  userRegisterCtrl,
  loginUserCtrl,
  fetchUsersCtrl,
  fetchUserDetailsCtrl,
  userProfileCtrl,
  updateUserCtrl,
  updateUserPasswordCtrl,
  forgetPasswordToken,
  passwordResetCtrl,
} = require("../../controllers/users/userCtrl");
const authMiddleware = require("../../middlewares/auth/authMiddleware");

const userRoutes = express.Router();

userRoutes.post("/v1/register", userRegisterCtrl);
userRoutes.post("/v1/login", loginUserCtrl);

userRoutes.post("/v1/forget-password-token", forgetPasswordToken);
userRoutes.put("/v1/reset-password", passwordResetCtrl);

userRoutes.get("/v1/", authMiddleware, fetchUsersCtrl);
userRoutes.get("/v1/:id", fetchUserDetailsCtrl);
userRoutes.get("/v1/profile/:id", authMiddleware, userProfileCtrl);
userRoutes.put("/v1/password", authMiddleware, updateUserPasswordCtrl);
userRoutes.put("/v1", authMiddleware, updateUserCtrl);

module.exports = userRoutes;
