const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  desc: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  images: {
    type: [String],
    required: true
  },
  colors: {
    type: [String],
    required: true
  }
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
