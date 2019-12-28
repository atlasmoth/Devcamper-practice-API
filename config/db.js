const mongoose = require("mongoose");

module.exports = connectString =>
  mongoose.connect(connectString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
  });
