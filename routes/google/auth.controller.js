const jwt = require('jsonwebtoken');
const User = require('../../components/user/Model');

const googleCallback = (req, res) => {
  const token = jwt.sign({ id: req.user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
};

const googleLogin = async (req, res, next) => {
  try {
    const { id, email, name, photo } = req.body;
    const user = await User.findOne({ googleId: id, email: email });
    if (!user) {
      const newUser = new User({
        name,
        email,
        googleId: id,
        isVerified: true,
        avatar: photo
      });
      await newUser.save();
      const token = jwt.sign({ newUser }, 'secret', { expiresIn: '1h' });

      return res
        .status(200)
        .json({ status: 1, msg: 'user đã được tạo thành công', data: newUser, token: token });
    }
    const token = jwt.sign({ user }, 'secret', { expiresIn: '1h' });
    return res
      .status(202)
      .json({ status: 1, msg: 'đăng nhập thành công', data: user, token: token });

  } catch (error) {
    return res
      .status(500)
      .json({ status: 0, msg: error.message, data: null });
  }

}


module.exports = {
  googleCallback,
  googleLogin
}