
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const orderDetailSchema = new Schema(
    {
        product: { type: ObjectId, ref: 'product', required: true }, 
        quantity: { type: Number, default: 1, min: 1 }, 
        sizeSelected: { type: String, required: true },     
    }
)

const cartSchema = new Schema({
    userId: { type: ObjectId, ref: 'user' },
    items: [orderDetailSchema],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});




module.exports = mongoose.models.cart || mongoose.model('cart', cartSchema)
