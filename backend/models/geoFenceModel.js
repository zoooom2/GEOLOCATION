const mongoose = require('mongoose');

const { Schema, model, ObjectId } = mongoose;

const geoFenceSchema = new Schema({
  polygon: {
    vertices: {
      type: {
        type: String,
        enum: ['Polygon'],
        required: true,
      },
      coordinates: {
        type: [[Number]],
        required: true,
      },
    },
    center: {
      type: { type: String, enum: ['Point'], required: true },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
  },
  companyID: {
    type: ObjectId,
    ref: 'ClientProfile',
    required: true,
  },
  users: [
    {
      type: ObjectId,
      ref: 'User',
      required: true,
    },
  ],
});

const GeoFence = model('GeoFence', geoFenceSchema);
module.exports = GeoFence;
