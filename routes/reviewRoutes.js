const express = require("express");
const {
  getAllReviews,
  createReview,
  deleteReview,
  updateReview,
  setTourUserIds,
  getReview,
} = require("../controllers/reviewController");
const { protect, restrictTo } = require("../controllers/authController");

//Merge params to get tourID from tour router redirect
const router = express.Router({ mergeParams: true });

router.use(protect);

router
  .route("/")
  .get(getAllReviews)
  .post(protect, restrictTo("user"), setTourUserIds, createReview);

router
  .route("/:id")
  .get(getReview)
  .delete(protect, restrictTo("admin", "user"), deleteReview)
  .patch(protect, restrictTo("admin", "user"), updateReview);

module.exports = router;
