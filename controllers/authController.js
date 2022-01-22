const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/appError");
const sendEmail = require("../utils/email");

const generateToken = (id) =>
  jwt.sign({ _id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRESIN,
  });

//@desc     Signup a user
//@route    POST /api/users/signup
//@access   public
const signup = asyncHandler(async (req, res, next) => {
  const { name, email, password, passwordConfirm, passwordChangedAt } =
    req.body;
  const user = await User.create({
    name,
    email,
    password,
    passwordConfirm,
    passwordChangedAt,
  });
  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRESIN,
  });

  res.status(201).json({ status: "success", token, data: { user } });
});

//@desc     login a user
//@route    POST /api/users/login
//@access   public
const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  //Check if email and password are there
  if (!email || !password) {
    return next(new AppError("Please provide an email and password", 400));
  }
  const user = await User.findOne({ email }).select("+password");
  //Check if email exists
  if (!user) {
    return next(new AppError("Please provide a valid email and password", 400));
  }
  //Check if password matches
  const checkPassword = await user.passwordCheck(password, user.password);
  if (!checkPassword) {
    return next(new AppError("Please provide a valid email and password", 400));
  }
  //Send token if everything is okay
  const token = generateToken(user._id);
  res.status(201).json({ status: "success", token, data: { user } });
});

//@desc     Forgot Password
//@route    POST /api/users/forgotPassword
//@access   public
const forgotPassword = asyncHandler(async (req, res, next) => {
  //1) Get user based on the email
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError("Email doesn't exist", 404));
  }
  //2) Generate random token
  const token = user.generatePasswordResetToken();
  //To save the token geenrated in the method call in DB
  //validationBeforeSave: false --> so that the validators don't run here
  await user.save({ validateBeforeSave: false });
  //Send it to users email
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${token}`;

  const message = `Forgot your password? Push a PATCH request with new password and confirm password to ${resetURL}`;
  const options = {
    email,
    subject: "Forgot Password (Valid for 10 Minutes) | TravelMonkey",
    message,
  };

  try {
    await sendEmail(options);
    res.status(200).json({ status: "success", message: "Token sent to email" });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError("There was an error sending the email. Try again", 500)
    );
  }
});

//@desc     Reset Password
//@route    POST /api/users/resetPassword
//@access   public
const resetPassword = asyncHandler(async (req, res, next) => {
  //1) Get user based on token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  //2) if token didn't expire and there is a user, set the password
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  //3) Log the user in and send the JWT
  //Send token if everything is okay
  const token = generateToken(user._id);
  res.status(201).json({ status: "success", token });
});

//@desc     Update Password
//@route    POST /api/users/updatePassword
//@access   public
const updatePassword = asyncHandler(async (req, res, next) => {
  //1) Get user
  const { password, newPassword, newPasswordConfirm } = req.body;
  if (!password || !newPassword || !newPasswordConfirm) {
    return next(
      new AppError(
        "Please provide the current password and the new password",
        400
      )
    );
  }
  const user = await User.findById(req.user._id).select("+password");
  //2) If given password is correct
  const checkPassword = await user.passwordCheck(password, user.password);
  if (!checkPassword) {
    return next(new AppError("Wrong password", 400));
  }
  //3) If yes, update password
  user.password = newPassword;
  user.passwordConfirm = newPasswordConfirm;
  //Find and update won't work as expected as the middlewares and passwordconfirm validator won't run
  await user.save();
  //4) Log the password in, send JWT
  //Send token if everything is okay
  const token = generateToken(user._id);
  res.status(201).json({ status: "success", token });
});

const protect = asyncHandler(async (req, res, next) => {
  //Get the token from headers and check for it
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new AppError("You are not authorized. Please log in", 401));
  }

  //See if it is valid or not
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (!decoded) {
    return next(new AppError("You are not authorized. Please log in", 401));
  }

  //Check if user exists or not
  const user = await User.findById(decoded._id);
  if (!user) {
    return next(new AppError("The user doesn't exists any more.", 401));
  }

  //Check if user changed password after jwt was issued and block it if it does
  if (user.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        "User recently changed the password! Please login again",
        401
      )
    );
  }

  //GRANT ACCESS TO PROTECTED ROUTE
  req.user = user;
  next();
});

const restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      //403-Forbidden
      return next(
        new AppError("You are not authorized to access this resource", 403)
      );
    }
    next();
  };

module.exports = {
  signup,
  login,
  protect,
  restrictTo,
  forgotPassword,
  resetPassword,
  updatePassword,
};
