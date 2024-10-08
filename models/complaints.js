const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  number: {
    type: Number,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  status: {
    type: String,
    default: 'Not Answered'
  },
});

const Complaint = mongoose.model('Complaint', complaintSchema);

module.exports = Complaint;
