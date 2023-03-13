const expressAsyncHandler = require("express-async-handler");
const sgMail = require("@sendgrid/mail");
const crypto = require("crypto")
const generateToken = require("../../config/token/generateToken");
const User = require("../../model/user/User");
const validateMongodbId = require("../../utils/validateMongodbID");
sgMail.setApiKey(process.env.SEND_GRID);

//USER REGISTER
const userRegisterCtrl = expressAsyncHandler(async (req, res) => {
  //checkif user Exist
  const userExists = await User.findOne({ email: req?.body?.email });
  if (userExists) throw new Error("User already exists");
  try {
    const user = await User.create({
      firstName: req?.body?.firstName,
      lastName: req?.body?.lastName,
      email: req?.body?.email,
      password: req?.body?.password,
    });
    res.json(user);
  } catch (error) {
    res.json(error);
  }
});

//USER LOGIN
const loginUserCtrl = expressAsyncHandler(async (req, res) => {
  const { email, password } = req.body;
  //check if user Exist
  const userFound = await User.findOne({ email });
  //Check if password is match
  if (userFound && (await userFound.isPasswordMatched(password))) {
    res.json({
      _id: userFound?._id,
      firstName: userFound?.firstName,
      lastName: userFound?.lastName,
      email: userFound?.email,
      token: generateToken(userFound?._id),
    });
  } else if (!userFound) {
    res.status(404);
    throw new Error("Invalid Email!");
  } else {
    res.status(404);
    throw new Error("Invalid Password!");
  }
});

//FETCHING all users
const fetchUsersCtrl = expressAsyncHandler(async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    res.json(error);
  }
});

//DELETE USER
const deleteUserCtrl = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  console.log(id);
  //checkif user id is valid
  validateMongodbId(id);
  try {
    const deletedUser = await User.findByIdAndDelete(id);
    res.json(deletedUser);
  } catch (error) {
    res.json(error);
  }
});

//Fetch single user
const fetchUserDetailsCtrl = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  //check if user id is valid
  validateMongodbId(id);
  try {
    const user = await User.findById(id);
    res.json(user);
  } catch (error) {
    res.json(error);
  }
})

//FETCH USER PROFILE
const userProfileCtrl = expressAsyncHandler(async (req, res) => {
  const { id } = req.params
  validateMongodbId(id)
  try {
    const myProfile = await User.findById(id)
    res.json(myProfile);
  } catch {
    res.json(error)
  }
})

//UPDATE USER PROFILE
const updateUserCtrl = expressAsyncHandler(async (req, res) => {
  const { _id } = req?.user

  validateMongodbId(_id)
  const user = await User.findByIdAndUpdate(_id, {
    firstName: req?.body?.firstName,
    lastName: req?.body?.lastName,
    email: req?.body?.email,
  }, {
    new: true,
    runValidators: true,
  })
  res.json(user)
})

//UPDATE PASSWORD
const updateUserPasswordCtrl = expressAsyncHandler(async (req, res) => {
  //destructure the login user
  const { _id } = req.user;
  const { password } = req.body;
  validateMongodbId(_id);
  //find the user  by _id
  const user = await User.findById(_id);

  if (password) {
    user.password = password;
    const updatedUser = await user.save();
    res.json(updatedUser);
  } else {
    res.json(user)
  }
})


//---------------------------------------
//Forgot token generator
//-----------------------------------------
const forgetPasswordToken = expressAsyncHandler(async (req, res) => {
  //find the user by email
  const { email } = req.body
  const user = await User.findOne({ email })
  if (!user) throw new Error("User not found")

  try {
    const token = await user.createPasswordResetToken()
    console.log(token)
    await user.save();

    //build your message
    const resetURL = `Reset your password within 10 minutes 
    <a href="http://localhost:3000/reset-password/${token}">
    Click to reset
    </a>`
    const msg = {
      to: email, // Change to your recipient
      from: 'techguruindia.ltd@gmail.com', // Change to your verified sender
      subject: 'Express: Reset password',
      html: resetURL,
    };

    await sgMail.send(msg);
    res.json({
      msg: `A verification message is successfully sent to ${user?.email}.Reset now within 10 minutes, ${resetURL}`
    })
  } catch (error) {
    res.json(error)
  }

})

//---------------------------------------
//Passsword reset
//-------------------------------------------
const passwordResetCtrl = expressAsyncHandler(async (req, res) => {
  const { token, password } = req.body
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  //find this user by token
  const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpires: { $gt: new Date() } })
  if (!user) throw new Error("Token expires, try again");

  //update the paSSword
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save()
  res.json(user);
});




module.exports = {
  userRegisterCtrl,
  loginUserCtrl,
  fetchUsersCtrl,
  deleteUserCtrl,
  fetchUserDetailsCtrl,
  userProfileCtrl,
  updateUserCtrl,
  updateUserPasswordCtrl,
  forgetPasswordToken,
  passwordResetCtrl,

};
