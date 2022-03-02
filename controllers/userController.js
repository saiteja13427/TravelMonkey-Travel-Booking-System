const User = require("../models/userModel");
const AppError = require("../utils/appError");
const asyncHandler = require("../utils/asyncHandler");
const { deleteOne, updateOne, getOne, getAll } = require("./handleFactory");

const filterObj = (object, ...fields) => {
  const newObject = {};
  Object.keys(object).forEach((key) => {
    if (fields.includes(key)) {
      newObject[key] = object[key];
    }
  });
  return newObject;
};

const getAllUsers = getAll(User);

const createUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not defined. Use /signup instead",
  });
};

const getUser = getOne(User);

//Don't attempt to change password with this
const updateUser = updateOne(User);

const deleteUser = deleteOne(User);

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

const getMe = (req, res, next) => {
  req.params.id = req.user._id;
  next();
};

module.exports = {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
  getMe,
};
