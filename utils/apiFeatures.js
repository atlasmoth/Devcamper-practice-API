class ApiFeatures {
  constructor(queryStr, mainQuery) {
    this.queryStr = queryStr;
    this.mainQuery = mainQuery;
  }
  filter() {
    // make copy of req.query
    const reqQuery = { ...this.queryStr };
    // exclude unnecessary fields
    const removeFields = ["select", "sort", "page", "limit"];

    removeFields.forEach(function(field) {
      delete reqQuery[field];
    });
    // convert to string to replace query operators
    let queryStr = JSON.stringify(reqQuery).replace(
      /\b(gt|gte|lt|lte|in)\b/,
      match => `$${match}`
    );
    //convert back to POJO
    const query = JSON.parse(queryStr);

    return this.mainQuery.find(query);
  }
  get sort() {
    return this.queryStr.sort
      ? this.queryStr.sort.split(",").join(" ")
      : "-createdAt";
  }
  get fields() {
    return this.queryStr.select
      ? this.queryStr.select.split(",").join(" ")
      : "";
  }
  get limit() {
    return this.queryStr.limit ? Number(this.queryStr.limit) : 100;
  }
  get page() {
    const page = this.queryStr.page
      ? Number(this.queryStr.page) <= 0
        ? 1
        : Number(this.queryStr.page)
      : 1;
    return page - 1;
  }
}

module.exports = ApiFeatures;
