/* eslint-disable no-plusplus */
const { default: mongoose } = require('mongoose');
const Geofence = require('../models/geoFenceModel');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

// let io;

// exports.setIo = (socketIo) => {
//   io = socketIo;
// };

const isPointInsidePolygon = (point, polygon) => {
  const x = point.longitude;
  const y = point.latitude;
  let isInside = false;

  for (
    let i = 0, j = polygon.vertices.coordinates.length - 1;
    i < polygon.vertices.length;
    j = i++
  ) {
    const xi = polygon.vertices.coordinates[i].longitude;
    const yi = polygon.vertices.coordinates[i].latitude;
    const xj = polygon.vertices.coordinates[j].longitude;
    const yj = polygon.vertices.coordinates[j].latitude;

    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) {
      isInside = !isInside;
    }
  }
  return isInside;
};

exports.createGeoFence = catchAsync(async (req, res) => {
  const newLocation = await Geofence.create({
    companyID: req.user.companyID,
    polygon: req.body.polygon,
    uid: req.body.uid,
  });
  res.status(201).json(newLocation);
});

exports.checkLocation = async (data) => {
  // find polygons based on the company the user belong to
  const companyID = new mongoose.Types.ObjectId(data.companyID);

  const polygons = await Geofence.find({
    companyID,
  });

  console.log(polygons);

  // check if the position is inside the geofence
  const insidePerimeters = polygons.filter(({ polygon }) =>
    isPointInsidePolygon(
      { longitude: data.longitude, latitude: data.latitude },
      polygon,
    ),
  );

  console.log(insidePerimeters);

  // // return insidePerimeters;
  if (insidePerimeters) {
    User.findByIdAndUpdate(data.userID, {});
  }
};
