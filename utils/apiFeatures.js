class APIFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  filter() {
    //Copying like this as JS object is assigned by reference
    //1a) Filtering
    const queryObject = { ...this.queryStr };
    const exclude = ["page", "sort", "limit", "fields"];

    //Removing special query parameters used for other functionality
    exclude.forEach((element) => {
      delete queryObject[element];
    });

    //1b) Advanced Filtering
    //{'difficulty': {'gt': '5'}} -> {'difficulty': {'$gt': '5'}}
    let queryString = JSON.stringify(queryObject);
    queryString = queryString.replace(
      /\b(gt|gte|lt|lte)\b/g,
      (match) => `$${match}`
    );

    //Building query based on query parameters
    this.query = this.query.find(JSON.parse(queryString));
    return this;
  }

  sort() {
    //2) Sorting
    if (this.queryStr.sort) {
      const sortBy = this.queryStr.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }

  project() {
    //3) Projecting
    if (this.queryStr.fields) {
      const fields = this.queryStr.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }
    return this;
  }

  paginate() {
    //4) Pagination
    const page = this.queryStr.page || 1;
    const limit = this.queryStr.limit || 10;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = APIFeatures;
