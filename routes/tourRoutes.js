const express = require("express");
const {
  getAllTours,
  getTour,
  createTour,
  updateTour,
  deleteTour,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
} = require("../controllers/tourController");
const reviewRouter = require("./reviewRoutes");
const { protect, restrictTo } = require("../controllers/authController");
const { create } = require("../models/userModel");

const router = express.Router();

router.route("/tour-stats").get(getTourStats);
router.route("/top-5-cheap").get(aliasTopTours, getAllTours);

router
  .route("/monthly-plan/:year")
  .get(protect, restrictTo("admin", "lead-guide", "guide"), getMonthlyPlan);

router
  .route("/")
  .get(getAllTours)
  .post(protect, restrictTo("admin", "lead-guide"), createTour);
router
  .route("/:id")
  .get(getTour)
  .patch(protect, restrictTo("admin", "lead-guide"), updateTour)
  .delete(protect, restrictTo("admin", "lead-guide"), deleteTour);

// router
//   .route("/:tourId/reviews")
//   .post(protect, restrictTo("user"), createReview);

//Redirecting to review Router "/"
router.use("/:tourId/reviews", reviewRouter);

module.exports = router;
