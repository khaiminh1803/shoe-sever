
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const sizeSchema = new Schema({
  size: { type: String },
  quantity: { type: Number, min: 0 },
})

const schema = new Schema({
  
  name: { type: String },
  price: { type: Number },
  description: { type: String },
  image: {
    type: [String],
    required: true
  },
  sizes: [sizeSchema],
  brand: { type: ObjectId, ref: 'brand' }, 
  category: { type: ObjectId, ref: 'category' },
});

module.exports = mongoose.models.product ||
  mongoose.model('product', schema);

// product -----> products
/**
 * Database ----- Database
 * Table -------- Collection
 * Row ---------- Document
 * Column ------- Field
 */