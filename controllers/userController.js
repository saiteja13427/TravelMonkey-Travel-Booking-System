const User = require("../models/userModel");
const AppError = require("../utils/appError");
const asyncHandler = require("../utils/asyncHandler");

const filterObj = (object, ...fields) => {
  const newObject = {};
  Object.keys(object).forEach((key) => {
    if (fields.includes(key)) {
      newObject[key] = object[key];
    }
  });
  return newObject;
};

const getAllUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find({});
  res.status(200).json({ status: "success", data: { users } });
});
const createUser = () => {};
const getUser = () => {};
const updateUser = () => {};
const deleteUser = () => {};

const updateMe = asyncHandler(async (req, res, next) => {
  //Create error is user posts password;
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError("This route is not for password updates", 400));
  }
  //Else update user data
  const id = req.user._id;

  //Filtered unwanted fields i,e other than name and email
  const filteredObject = filterObj(req.body, "name", "email");
  console.log(filteredObject);
  const updatedUser = await User.findByIdAndUpdate(id, filteredObject, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ status: "success", data: { user: updatedUser } });
});

const deleteMe = asyncHandler(async (req, res, next) => {
  const id = req.user._id;
  await User.findByIdAndUpdate(id, { active: false });
  res.status(204).json({ status: "success" });
});

module.exports = {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
};
