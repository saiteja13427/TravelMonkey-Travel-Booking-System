const fs = require("fs");
const Tour = require("../models/tourModel");
const APIFeatures = require("../utils/apiFeatures");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/appError");

//@desc     Get all tours
//@route    GET /api/tours
//@access   public
const getAllTours = asyncHandler(async (req, res, next) => {
  //Creating all filters in the class APIFeatures
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .project()
    .paginate();
  const tours = await features.query;
  //Sending response
  res
    .status(200)
    .json({ status: "success", results: tours.length, data: { tours } });
});

//@desc     Get tours by id
//@route    GET /api/tours/:id
//@access   public
const getTour = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const tour = await Tour.findById(id);
  if (!tour) {
    return next(new AppError(`Tour with ID ${id} not found`, 404));
  }
  res.status(200).json({ status: "success", data: { tour } });
});

//@desc     Create a tour
//@route    POST /api/tours
//@access   public
const createTour = asyncHandler(async (req, res, next) => {
  const newTour = await Tour.create(req.body);
  res.status(201).json({ status: "success", data: { tour: newTour } });
});

//@desc     Update a tours
//@route    PATCH /api/tours/:id
//@access   public
const updateTour = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const tour = await Tour.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!tour) {
    return next(new AppError(`Tour with ID ${id} Not Found`, 404));
  }
  res.status(200).json({ status: "success", data: { tour: tour } });
});

//@desc     Delete a tours
//@route    DELETE /api/tours/:ID
//@access   public
const deleteTour = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const tour = await Tour.findByIdAndDelete(id);
  if (!tour) {
    return next(new AppError(`Tour with ID ${id} Not Found`, 404));
  }
  res.status(204).json({ status: "success" });
});

//@desc     Alias to Get all tours with some filter
//@route    GET /api/tours/top-5-cheap
//@access   public
const aliasTopTours = (req, res, next) => {
  req.query.limit = "5";
  req.query.sort = "-ratingsAverage price";
  req.query.fields = "name, price, ratingsAverage, summary, difficulty";
  next();
};

//@desc     Get tour stats (Aggregation pipeline)
//@route    POST /api/tours/tour-stats
//@access   public
const getTourStats = asyncHandler(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 3.5 } },
    },
    {
      $group: {
        _id: { $toUpper: "$difficulty" },
        numTours: { $sum: 1 },
        numRatings: { $sum: "$ratingsQuantity" },
        averageRating: { $avg: "$ratingsAverage" },
        averagrPrice: { $avg: "$price" },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
      },
    },
    {
      $sort: { averagrPrice: -1 },
    },
    // {
    //   $match: { _id: { $ne: "EASY" } },
    // },
  ]);

  res.status(200).json({ status: "success", data: { stats } });
});

//@desc     Get monthly plan (aggregation pipeline)
//@route    GET /api/tours/monthly-plan/:year
//@access   public
const getMonthlyPlan = asyncHandler(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: "$startDates",
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: "$startDates" },
        numTours: { $sum: 1 },
        tours: { $push: "$name" },
      },
    },
    {
      $sort: { numTours: -1 },
    },
    {
      $addFields: { month: "$_id" },
    },
    {
      $project: { _id: 0 },
    },
    {
      $limit: 12,
    },
  ]);
  // const plan = "Hello";
  res.status(200).json({ status: "success", data: { plan } });
});

module.exports = {
  getAllTours,
  getTour,
  createTour,
  updateTour,
  deleteTour,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
};
