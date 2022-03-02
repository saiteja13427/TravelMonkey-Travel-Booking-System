const express = require("express");
const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
  protect,
  restrictTo,
} = require("../controllers/authController");
const {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
  getMe,
} = require("../controllers/userController");

const router = express.Router();

router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/forgotPassword").post(forgotPassword);
router.route("/resetPassword/:token").patch(resetPassword);
router.route("/updatePassword/").patch(protect, updatePassword);

router.use(protect);
router.route("/updateMe").patch(protect, updateMe);
router.route("/deleteMe").delete(protect, deleteMe);
router.route("/me").get(protect, getMe, getUser);

router.use(restrictTo("admin"));
router.route("/").get(getAllUsers).post(createUser);
router
  .route("/:id")
  .get(getUser)
  .patch(updateUser)
  .delete(protect, restrictTo("admin"), deleteUser);

module.exports = router;
