    
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const categorySchema = new Schema({
  
    name: {
        type: String, // kiểu dữ liệu
        required: true, // bắt buộc có
        unique: true, // không trùng
        trim: true, // xóa khoảng trắng ở đầu và cuối
        minlength: 3, // độ dài tối thiểu
        maxlength: 255, // độ dài tối đa
        default: 'No name' // giá trị mặc định
    },
});

module.exports = mongoose.models.category || mongoose.model('category', categorySchema);
// category -----> categories
/**
 * Database ----- Database
 * Table -------- Collection
 * Row ---------- Document
 * Column ------- Field
 */