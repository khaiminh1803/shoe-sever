
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const schema = new Schema({
    code: { type: String, required: true },
    minPurchaseAmount: { type: Number, required: true },
    value: { type: Number, required: true },
    description: { type: String, required: true },
    startDate: { type: Date, default: Date.now, required: true },
    endDate: { type: Date, default: () => Date.now() + 7 * 24 * 60 * 60 * 1000, required: true }
});

module.exports = mongoose.models.voucher || mongoose.model('voucher', schema)
// product -----> products
/**
 * Database ----- Database
 * Table -------- Collection
 * Row ---------- Document
 * Column ------- Field
 */