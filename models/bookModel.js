const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  author: String,
  description: String,
  title: String,
});

const Book = mongoose.model("Book", bookSchema);

module.exports = Book;