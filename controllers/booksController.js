const catchAsync = require("../utils/catchAsync");
const Book = require("../models/bookModel");

exports.getBooks = catchAsync(async(req, res, next)=>{
    const getBook = await Book.find({})
    res.status(200).json({
        status: "success",
        data: {
            getBook
        },
    });
})

exports.createBook = catchAsync(async(req, res, next)=>{
    let newBooking = await Book.create(req.body);
    res.status(201).json({
        status: "success",
        data: {
            newBooking
        },
    });
})