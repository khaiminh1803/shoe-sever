const express = require('express');
const passport = require('passport');
const router = express.Router();
const authController = require('./auth.controller');

router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  authController.googleCallback
);
router.post('/google/login',
  authController.googleLogin,
);

module.exports = router;