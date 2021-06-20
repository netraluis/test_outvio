const express = require('express');
const router = express.Router();
const booksController = require('../controllers/booksController')


router.route('/').get( booksController.getBooks);

router.route('/').post( booksController.createBook);



module.exports = router;