/* eslint-disable no-plusplus */
const GeoFence = require('../models/geoFenceModel');
const catchAsync = require('../utils/catchAsync');

let io;

exports.setIo = (socketIo) => {
  io = socketIo;
};

const isPointInsidePolygon = (point, polygon) => {
  const x = point.longitude;
  const y = point.latitude;
  let isInside = false;
  for (
    let i = 0, j = polygon.vertices.length - 1;
    i < polygon.vertices.length;
    j = i++
  ) {
    const xi = polygon.vertices[i].longitude;
    const yi = polygon.vertices[i].latitude;
    const xj = polygon.vertices[j].longitude;
    const yj = polygon.vertices[j].latitude;

    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) {
      isInside = !isInside;
    }
  }
  return isInside;
};

exports.createGeoFence = catchAsync(async (req, res) => {
  const { companyName, polygon } = req.body;
  const newLocation = await GeoFence.create({ companyName, polygon });
  res.status(201).json(newLocation);
});

exports.updateLocation = catchAsync(async (req, res) => {
  const { latitude, longitude } = req.body;
  const userLocation = { latitude, longitude };
  io.emit('locationUpdate', userLocation);
  res.status(200).json(userLocation);
});

exports.checkLocation = catchAsync(async (req, res) => {
  const { latitude, longitude, companyName } = req.body;
  const userLocation = { latitude, longitude };
  const locations = await GeoFence.find({ companyName });

  const insidePerimeters = locations.filter((location) =>
    isPointInsidePolygon(userLocation, location),
  );
  res.json(insidePerimeters);
});
