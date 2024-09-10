var express = require('express');
var router = express.Router();
const userController = require('../components/user/Controller')
const jwt = require('jsonwebtoken')
const {authenWeb} = require('../middle/Authen')

/* GET home page. */
router.get('/',[authenWeb], function (req, res, next) {
  res.render('index');
});
router.get('/notification', function (req, res, next) {
  const message = req.session.errorMessage;
  // Clear the message after retrieving it
  req.session.errorMessage = null;
  res.render('user/notification', {message});
});

// http://localhost:3000/login
// hiển thị trang login
router.get('/login',[authenWeb], async function (req, res, next) {
  res.render('user/login');
});

router.post('/login', async function (req, res, next) {
  try {
    const { email, password } = req.body
    const result = await userController.login(email, password)

    if (result) {
      // khi login thành công
      // tạo token,lưu token vào session 
      const token = jwt.sign({ id: result._id, role: result.role }, 'secret', { expiresIn: '1h' })
      console.log(token);
      req.session.token = token
      return res.redirect('/')
    } else {
      return res.redirect('/login')
    }
  } catch (error) {
    console.log('Login failed: ', error);
    return res.redirect('/login')
  }
});

// http://localhost:3000/logout
// xử lý logout
// xóa token trong session
// chuyển hướng sang trang login
router.get('/logout', async function (req, res, next) {
  try {
    req.session.destroy();
    return res.redirect('/login')
  } catch (error) {
    console.log('Logout error: ', error);
    return res.redirect('/login')
  }
});
module.exports = router;

module.exports = router;
