const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/appError");
const APIFeatures = require("../utils/apiFeatures");

const deleteOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const document = await Model.findByIdAndDelete(id);
    if (!document) {
      return next(new AppError(`No Document with ID ${id} Not Found`, 404));
    }
    res.status(204).json({ status: "success" });
  });

const updateOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const document = await Model.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!document) {
      return next(new AppError(`Document with ID ${id} Not Found`, 404));
    }
    res.status(200).json({ status: "success", data: { document } });
  });

const createOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const newDocument = await Model.create(req.body);
    res
      .status(201)
      .json({ status: "success", data: { document: newDocument } });
  });

const getOne = (Model, popOptions) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const document = await Model.findById(id).populate(popOptions);
    if (!document) {
      return next(new AppError(`Document with ID ${id} not found`, 404));
    }
    res.status(200).json({ status: "success", data: { document } });
  });

const getAll = (Model) =>
  asyncHandler(async (req, res, next) => {
    let filter = {};
    if (req.params.tourId) {
      filter = { tour: req.params.tourId };
    }
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .project()
      .paginate();

    // To get query stats
    // const documents = await features.query.explain();
    const documents = await features.query;
    //Sending response
    res.status(200).json({
      status: "success",
      results: documents.length,
      data: { documents },
    });
  });

module.exports = { deleteOne, updateOne, createOne, getOne, getAll };
