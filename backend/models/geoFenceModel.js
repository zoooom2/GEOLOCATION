const mongoose = require('mongoose');

const { Schema, model, ObjectId } = mongoose;

const geoFenceSchema = new Schema({
  polygon: {
    vertices: [
      {
        longitude: { type: Number, required: true },
        latitude: { type: Number, required: true },
      },
    ],
    center: { type: Number, required: true },
  },
  companyName: {
    type: ObjectId,
    ref: 'ClientProfile',
    required: true,
  },
});

const GeoFence = model('GeoFence', geoFenceSchema);
module.exports = GeoFence;
