const Review = require("../models/reviewModel");
const asyncHandler = require("../utils/asyncHandler");
const {
  deleteOne,
  updateOne,
  createOne,
  getOne,
  getAll,
} = require("./handleFactory");

//@desc     Get all reviews
//@route    GET /api/reviews or /api/tours/:tourId/reviews
//@access   public
const getAllReviews = getAll(Review);

//@desc     Get a reviews
//@route    GET /api/reviews/:id
//@access   public

const getReview = getOne(Review);

//@desc     Create a review
//@route    GET api/reviews or /api/tours/:tourId/reviews
//@access   public
const createReview = createOne(Review);

//@desc     Delete a review
//@route    DELETE api/reviews/:id or /api/tours/:tourId/reviews/:id
//@access   protected
const deleteReview = deleteOne(Review);

//@desc     Update a review
//@route    PATCH api/reviews/:id
//@access   protected
const updateReview = updateOne(Review);

const setTourUserIds = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user._id;
  next();
};

module.exports = {
  getAllReviews,
  getReview,
  createReview,
  deleteReview,
  updateReview,
  setTourUserIds,
};
