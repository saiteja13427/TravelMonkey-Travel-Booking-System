const mongoose = require("mongoose");
//Library for custom validator
const validator = require("validator");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please input your name"],
  },
  email: {
    type: String,
    unique: true,
    required: [true, "Please input your email"],
    lowercase: true,
    validate: [validator.isEmail, "Please input a valid email"],
  },
  photo: {
    type: String,
  },
  password: {
    type: String,
    required: [true, "Please input a password"],
    minlength: 8,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please input a confirm password"],
  },
});

const User = mongoose.model("User", userSchema);
module.exports = User;
