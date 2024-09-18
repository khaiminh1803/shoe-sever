const userModel = require('./Model')
const bcrypt = require('bcryptjs')
const crypto = require('crypto');
const nodemailer = require('nodemailer');
require('dotenv').config();
const client = require('./RedisClient');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
});

const sendVerificationCode = async (email) => {
    try {
        const verificationCode = crypto.randomInt(100000, 999999).toString();

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your verification code',
            text: `Your verification code is ${verificationCode}.`
        };
        await transporter.sendMail(mailOptions);
        await client.set(`verificationCode:${email}`, verificationCode, { EX: 300 });
        console.log('Verification code sent');
    } catch (error) {
        console.log('Error sending verification code:', error);
    }
};

const verifyCode = async (email, code) => {
    try {
        const result = await client.get(`verificationCode:${email}`);
        let user = await userModel.findOne({ email })
        if (user && result === code) {
            user.isVerified = true;
            await user.save();
            await client.del(`verificationCode:${email}`);
            return true;
        }
    } catch (error) {
        console.log('Verification code error:', error);
    }
    return false;
};

const sendResetPasswordCode = async (email) => {
    try {
        const resetCode = crypto.randomInt(100000, 999999).toString();
        await client.set(`resetPasswordCode:${email}`, resetCode, { EX: 300 });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your Password Reset Code',
            text: `Your password reset code is ${resetCode}.`
        };
        await transporter.sendMail(mailOptions);
        console.log('Reset password code sent');
    } catch (error) {
        console.log('Error sending reset password code:', error);
    }
};

const resetPassword = async (email, code, newPassword, confirmPassword) => {
    try {
        if (newPassword !== confirmPassword) {
            return { success: false, message: "Passwords do not match" };
        }
        const storedCode = await client.get(`resetPasswordCode:${email}`);
        if (storedCode !== code) {
            return { success: false, message: "Invalid or expired code" };
        }
        const user = await userModel.findOne({ email });
        if (!user) {
            return { success: false, message: "User not found" };
        }
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(newPassword, salt);
        user.password = hash;
        await user.save();
        await client.del(`resetPasswordCode:${email}`);
        return { success: true, message: "Password reset successfully" };
    } catch (error) {
        console.log('Error resetting password:', error);
        return { success: false, message: "Server error" };
    }
};

const changePassword = async (userId, oldPassword, newPassword) => {
    try {
        const user = await userModel.findById(userId);
        if (!user) {
            console.log("User not found");
            return
        }
        const isMatch = bcrypt.compareSync(oldPassword, user.password);
        if (!isMatch) {
            return false
        }
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(newPassword, salt);
        user.password = hash;
        await user.save();
        return true
    } catch (error) {
        console.log('Change password service error: ', error);
        return false
    }
}

const register = async (email, password, name) => {
    try {
        let user = await userModel.findOne({ email })
        if (!user) {
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(password, salt);
            await userModel.create({
                email,
                password: hash,
                name,
            })
            return true
        }
    } catch (error) {
        console.log('User register error: ', error)
    }
    return false
}

const login = async (email, password) => {
    try {
        let user = await userModel.findOne({ email })
        if (user) {
            const isMatch = bcrypt.compareSync(password, user.password)
            return isMatch ? user : false
        }
    } catch (error) {
        console.log("User service login error: ", error)
    }
    return false
}

const createUser = async (email, password, name, address, phonenumber, avatar, role) => {
    try {
        let user = await userModel.findOne({ email })
        if (!user) {
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(password, salt);
            await userModel.create({
                email,
                password: hash,
                name,
                address,
                phonenumber,
                avatar,
                role,
                isVerified: true
            })
            return true
        }
    } catch (error) {
        console.log('User service register error: ', error)
    }
    return false
}


// update profile
const updateProfile = async (id, name, email, address, phonenumber, avatar, role) => {
    try {
        const user = await userModel.findById(id)
        if (user) {
            user.name = name ? name : user.name
            user.email = email ? email : user.email
            user.address = address ? address : user.address
            user.phonenumber = phonenumber ? phonenumber : user.phonenumber
            user.avatar = avatar ? avatar : user.avatar
            user.role = role ? role : user.role
            await user.save()
            return user
        }
    } catch (error) {
        console.log('Update profile error: ', error);
    }
    return false
}

// danh sách user
const getAllUsers = async () => {
    try {
        return await userModel.find()
    } catch (error) {
        console.log('Get all users error: ', error);
        throw error;
    }
}

const getUserById = async (id) => {
    try {
        return userModel.findById(id)
    } catch (error) {
        console.log('Get user by id error', error);
        return null
    }
}

const deleteUserById = async (id) => {
    try {
        await userModel.findByIdAndDelete(id)
        return true
    }
    catch (error) {
        console.log('Delete user error: ', error);
        throw error;
    }
    return false;
}




module.exports = { login, register, updateProfile, getAllUsers, getUserById, deleteUserById, sendVerificationCode, verifyCode, createUser, changePassword, sendResetPasswordCode, resetPassword }





