
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const schema = new Schema({

    name: {type: String},
    email: {type: String, required: true,unique: true},
    password: {type: String},
    avatar: {type: String, default: "https://i.pinimg.com/736x/dc/53/50/dc5350243970437d9fff2c8db3a9975b.jpg"},
    role: {type: Number, default: 2}, //0 admin level 1 // 1 admin level 2 // 2 customer
    phonenumber: {type: String, default: "Chưa cập nhật"},
    address: {type: String, default: "Chưa cập nhật"},
    isVerified: { type: Boolean, default: false }, // Trạng thái xác thực
    // verificationCode: { type: String }, // Code xác thực
    googleId: { type: String, required: false },
});

module.exports = mongoose.models.user || mongoose.model('user', schema)
// product -----> products
/**
 * Database ----- Database
 * Table -------- Collection
 * Row ---------- Document
 * Column ------- Field
 */