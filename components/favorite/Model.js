
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const favoriteSchema = new Schema({
    userId: { type: ObjectId, ref: 'user' },
    productId: { type: ObjectId, ref: 'product' },
});

module.exports = mongoose.models.favorite || mongoose.model('favorite', favoriteSchema);
// category -----> categories
/**
 * Database ----- Database
 * Table -------- Collection
 * Row ---------- Document
 * Column ------- Field
 */