'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var ContactSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique : true
  },
  mobile: {
    type: String,
    required: true
  },
  companyname: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true
  },
  createdUserid: {
    type: Schema.Types.ObjectId, ref: 'User'
  },
  active: Boolean
}, { timestamps: true });

module.exports = mongoose.model('Contact', ContactSchema);