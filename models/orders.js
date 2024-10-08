const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderItemSchema = new Schema({
    name: { type: String, required: true },
    size: { type: String },
    includeStand: { type: String },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    image: {
        filename: { type: String, required: true },
        mimetype: { type: String, required: true },
    },
});

const orderSchema = new Schema({
    orderNumber: { type: String, required: true, unique: true },
    fname: { type: String, required: true },
    lname: { type: String, required: true },
    email: { type: String, required: true },
    number: { type: String, required: true },
    shippingMethod: { type: String, required: true },
    address: { type: String },
    city: { type: String },
    building: { type: String },
    floor: { type: String },
    aprt: { type: String },
    post: { type: String },
    workingAddress: { type: String },
    items: [orderItemSchema],
    total: { type: Number, required: true },
    status: { type: String, default: 'pending' },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Order', orderSchema);
