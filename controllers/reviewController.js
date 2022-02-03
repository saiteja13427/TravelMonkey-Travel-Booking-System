const Review = require("../models/reviewModel");
const asyncHandler = require("../utils/asyncHandler");

//@desc     Get all reviews
//@route    GET /api/reviews
//@access   public
const getAllReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find();
  res
    .status(200)
    .json({ status: "success", results: reviews.length, data: { reviews } });
});

//@desc     Create a reviews
//@route    GET /api/reviews
//@access   public
const createReview = asyncHandler(async (req, res) => {
  const id = req.user._id;
  const { review, rating, tour } = req.body;
  const newReview = new Review({
    review,
    rating,
    user: id,
    tour,
  });
  await newReview.save();
  res.status(201).json({ status: "success", data: { review: newReview } });
});

module.exports = { getAllReviews, createReview };
