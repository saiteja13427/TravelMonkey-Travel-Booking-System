/* eslint-disable prefer-arrow-callback */
const mongoose = require("mongoose");
const slugify = require("slugify");
// const User = require("./userModel");

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A Tour Must Have A Name"],
      unique: true,
      trim: true,
    },
    duration: {
      type: Number,
      required: [true, "A Tour Must Have A Duration"],
    },
    summary: {
      type: String,
      trim: true,
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    maxGroupSize: {
      type: Number,
      required: [true, "A Tour Must Have A Group Size"],
    },
    difficulty: {
      type: String,
      required: [true, "A Tour Must Have A Difficult"],
      enum: {
        values: ["easy", "medium", "difficult"],
        message: "Difficulty is either easy, medium or difficult",
      },
    },
    price: {
      type: Number,
      required: [true, "A Tour Must Have A Price"],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          //this only points to current document on new document creation so won't work on update
          return val < this.price;
        },
        message: "Price Discount {VALUE} should be less then price ",
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      max: [5, "The rating must be below 5.0"],
      min: [1, "The rating must be above 1.0"],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    imageCover: {
      type: String,
      required: [true, "A Tour Must Have A Cover Image"],
    },
    images: [String],
    startDates: [Date],
    slug: String,
    secretTour: {
      type: Boolean,
      default: false,
    },
    //For start location
    startLocation: {
      //GeoJSON
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
      },
      //Longitude first and then latitude in the array
      coordinates: [Number],
      address: String,
      description: String,
    },
    //For all the other locations in the tour
    locations: [
      {
        type: {
          type: String,
          default: "Point",
          enum: ["Point"],
        },
        //Longitude first and then latitude in the array
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

//Single Index
// tourSchema.index({ price: 1});
tourSchema.index({ slug: 1 });
//Compound Index
tourSchema.index({ price: 1, ratingsAverage: -1 });

//Virtual Property
//Arrow function doesn't work as it doesn't get this!!
tourSchema.virtual("durationWeeks").get(function () {
  return this.duration / 7;
});

tourSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "tour",
  localField: "_id",
});

//MIDDLEWARES
//1) DOCUMENT MIDDLEWARE
//PRE SAVE HOOK/MIDDLEWARE
tourSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

//If we wanted to embed guides
// tourSchema.pre("save", async function (next) {
//   const guidesPromises = this.guides.map(
//     async (guide) => await User.findById(guide)
//   );
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

//POST SAVE HOOK/MIDDLEWARE
// tourSchema.post("save", function (doc, next) {
//   console.log(doc);
//   next();
// });

//2) QUERY MIDDLEWARE
//PRE FIND
tourSchema.pre(/^find/, function (next) {
  //Now we will not return the tours which are secretTours
  //this here points to query object and we chain this find on the given query object
  this.find({ secretTour: { $ne: true } });

  this.start = Date.now();
  next();
});

//Query middleware to populate
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: "guides",
    select: "-__v",
  });
  next();
});

//POSTFIND
//docs --> All the returned docs.
tourSchema.post(/^find/, function (docs, next) {
  // console.log(docs);
  //Finding time to execute the find operation
  console.log(`Query took ${Date.now() - this.start} milliseconds`);
  next();
});

//3) AGGREGATE MIDDLEWARE
//PRE AGGREGATE
tourSchema.pre("aggregate", function (next) {
  //Removing the seret tour by pushing a match stage at the beginning of the aggragate pipeline
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  // console.log(this);
  next();
});

const Tour = mongoose.model("Tour", tourSchema);
module.exports = Tour;
