const mongoose = require("mongoose");
const brcypt = require("bcryptjs");
//Library for custom validator
const validator = require("validator");
const crypto = require("crypto");

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
  role: {
    type: String,
    default: "user",
    enum: ["user", "admin", "guide", "lead-guide"],
  },
  password: {
    type: String,
    required: [true, "Please input a password"],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please input a confirm password"],
    //This validator works only on save so have to use save on update as well
    validate: {
      validator: function (el) {
        return this.password === el;
      },
      message: "Password and confirm password doesn't match",
    },
  },
  passwordChangedAt: {
    type: Date,
    select: false,
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    select: false,
    default: true,
  },
});

userSchema.pre("save", async function (next) {
  //Password is hashed only if password is modified
  if (this.isModified("password")) {
    //Hashing password with 10 round saltings
    this.password = await brcypt.hash(this.password, 10);
    //Don't persist password confirm to DB as it is unnecessary
    this.passwordConfirm = undefined;
  }
  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();
  //Subtracting 1000ms because in some cases the token might be generated before this is set due to async nature
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.passwordCheck = async function (
  enteredPassword,
  realPassword
) {
  return await brcypt.compare(enteredPassword, realPassword);
};

userSchema.methods.changedPasswordAfter = function (jwtTimeStamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    if (changedTimeStamp > jwtTimeStamp) return true;
  }
  return false;
};

userSchema.methods.generatePasswordResetToken = function () {
  const resetToken = crypto.randomBytes(12).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  //Setting the expires to 10 minutes from now
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  // console.log(resetToken, this.passwordResetToken);
  return resetToken;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
