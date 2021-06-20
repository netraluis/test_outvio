const express = require('express');

const router = express.Router();

const authController = require('../controllers/authController');

router.route('/signup').post(authController.signup);
router.route('/login').post(authController.login);
router.patch(
    '/updateMyPassword',
    authController.protect,
    authController.updatePassword
  );


module.exports = router;