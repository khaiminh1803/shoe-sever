var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken')
const userController = require('../../components/user/Controller')
const { checkRegister } = require('../../middle/Validation')
const uploadFile = require('../../middle/UploadFile')
const CONFIG = require('../../config/Config')
// http://localhost:3000/api/users

// http://localhost:3000/api/users/login
router.post('/login', async function (req, res, next) {
  try {
    const { email, password } = req.body
    const user = await userController.login(email, password)
    if (user) {
      if (!user.isVerified) {
        return res.status(410).json({ error: true, message: 'Account not verified' });
      }

      // tạo token
      const token = jwt.sign({ user }, 'secret', { expiresIn: '1h' })
      const returnData = {
        error: false,
        responseTimestamp: new Date(),
        statusCode: 200,
        data: {
          token: token,
          user: user
        }
      }
      return res.status(200).json(returnData)
    } else {
      return res.status(400).json({ error: true, user: null })
    }
  } catch (error) {
    return res.status(500).json({ error: true, user: null })
  }
});

// http://localhost:3000/api/users/register
router.post('/register', [checkRegister], async function (req, res, next) {
  try {
    const { email, password, name } = req.body
    const user = await userController.register(email, password, name)

    if (user) {
      // Gửi code xác thực
      await userController.sendVerificationCode(email);
      res.status(200).json({ result: true, message: 'Registration successful. Please check your email for verification code.' })
    } else {
      res.status(400).json({ result: false, user: null })
    }
  } catch (error) {
    res.status(500).json({ result: false, user: null })
  }
});

// http://localhost:3000/api/users/verify
router.post('/verify', async (req, res) => {
  try {
    const { email, code } = req.body;
    const isVerified = await userController.verifyCode(email, code);

    if (isVerified) {
      return res.status(200).json({ result: true, message: 'Account verified successfully' });
    } else {
      return res.status(400).json({ result: false, message: 'Invalid or expired verification code' });
    }
  } catch (error) {
    return res.status(500).json({ result: false, message: 'Internal Server Error' });
  }
});

router.post('/upload', uploadFile.single('image'), async function (req, res, next) {
  try {
    const { file } = req
    if (!file) {
      res.status(400).json({ result: true, link: "" })
    } else {
      const url = `${CONFIG.CONSTANTS.IP}images/${file.filename}`
      res.status(200).json({ result: true, url: url })
    }
  } catch (error) {
    console.log('Upload image error: ', error);
    return res.json({ status: 500, link: "" })
  }
})

// update profile
router.post('/update-profile', async function (req, res, next) {
  try {
    const { id, name, email, address, phonenumber, avatar } = req.body
    const user = await userController.updateProfile(id, name, email, address, phonenumber, avatar)
    if (user) {
      res.status(200).json({ result: true, user })
    } else {
      res.status(400).json({ result: false, user: null })
    }
  } catch (error) {
    res.status(500).json({ result: false, user: null })
  }
})

router.post('/logout', (req, res) => {
  return res.status(200).json({ error: false, message: 'Logout successful' });
});

// http://localhost:3000/api/users/changePassword/userId
router.post('/changePassword/:userId', async function (req, res, next) {
  try {
    const { oldPassword, newPassword } = req.body
    const { userId } = req.params
    const result = await userController.changePassword(userId, oldPassword, newPassword)
    if (result) {
      res.status(200).json({ error: false, message: 'Change password succesfully' })
    } else if (result === false) {
      res.status(400).json({ error: true, message: 'Old password is incorrect' });
    } else {
      res.status(404).json({ error: true, message: 'User not found' });
    }
  } catch (error) {
    return res.status(500).json({ error: true, message: 'Sever error' })
  }
});

// http://localhost:3000/api/users/forgotPassword
router.post('/forgotPassword', async (req, res) => {
  try {
    const { email } = req.body;
    await userController.sendResetPasswordCode(email);
    res.status(200).json({ result: true, message: "Reset code sent to your email" });
  } catch (error) {
    res.status(500).json({ result: false, message: "Server error" });
  }
});

// http://localhost:3000/api/users/resetPassword
router.post('/resetPassword', async (req, res) => {
  try {
    const { email, code, newPassword, confirmPassword } = req.body;
    const result = await userController.resetPassword(email, code, newPassword, confirmPassword);

    if (result.success) {
      res.status(200).json({ success: true, message: result.message });
    } else {
      res.status(400).json({ success: false, message: result.message });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});


module.exports = router;
