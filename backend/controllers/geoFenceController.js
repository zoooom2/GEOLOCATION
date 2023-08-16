/* eslint-disable no-plusplus */
const { default: mongoose } = require('mongoose');
const turf = require('@turf/turf');
const Geofence = require('../models/geoFenceModel');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const GeoFence = require('../models/geoFenceModel');

// let io;

// exports.setIo = (socketIo) => {
//   io = socketIo;
// };

// const isPointInsidePolygon = (point, polygon) => {
//   const x = point.longitude;
//   const y = point.latitude;
//   let isInside = false;

//   console.log(x, y);

//   for (
//     let i = 0, j = polygon.vertices.coordinates.length - 1;
//     i < polygon.vertices.length;
//     j = i++
//   ) {
//     const xi = polygon.vertices.coordinates[i].longitude;
//     // console.log(xi);
//     const yi = polygon.vertices.coordinates[i].latitude;
//     const xj = polygon.vertices.coordinates[j].longitude;
//     const yj = polygon.vertices.coordinates[j].latitude;

//     const intersect =
//       yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
//     if (intersect) {
//       isInside = !isInside;
//     }
//   }
//   return isInside;
// };

exports.createGeoFence = catchAsync(async (req, res) => {
  const newLocation = await Geofence.create({
    companyID: req.user.companyID,
    polygon: req.body.polygon,
    uid: req.body.uid,
  });
  res.status(201).json(newLocation);
});

exports.getFenceByCompanyID = catchAsync(async (req, res) => {
  const fences = await Geofence.find({
    companyID: new mongoose.Types.ObjectId(req.user.companyID),
  });

  const mappedFences = fences.map((f) => ({
    uid: f.uid,
    vertices: f.polygon.vertices,
    center: f.polygon.center,
  }));

  res.status(200).json(mappedFences);
});

exports.updateFenceByUID = catchAsync(async (req, res) => {
  const { uid } = req.params;

  const update = {
    $set: {
      'polygon.vertices.coordinates': req.body.vertices,
      'polygon.center.coordinates': req.body.center,
    },
  };

  const fence = await GeoFence.findOneAndUpdate({ uid }, update, {
    new: true,
    useFindAndModify: false,
  });

  res.status(200).json(fence);
});

exports.deleteFenceByUID = catchAsync(async (req, res) => {
  const { uid } = req.params;
  const fence = await GeoFence.findOneAndDelete({ uid });
  res.status(200).json(fence);
});

exports.checkLocation = async (data) => {
  // find polygons based on the company the user belong to
  const companyID = new mongoose.Types.ObjectId(data.user.companyID);

  const polygons = await Geofence.find({
    companyID,
  });

  // check if the position is inside the geofence
  const insidePerimeters = polygons.filter(({ polygon }) =>
    turf.booleanPointInPolygon(
      turf.point([data.latitude, data.longitude]),
      turf.polygon([
        [...polygon.vertices.coordinates, polygon.vertices.coordinates[0]],
      ]),
    ),
  );

  console.log(insidePerimeters);
  // // return insidePerimeters;
  if (insidePerimeters[0] && !data.user.currentLocation) {
    // state user location and update location history
    await User.findByIdAndUpdate(data.user._id, {
      currentLocation: insidePerimeters[0]._id,
      $push: {
        locationHistory: {
          location: insidePerimeters[0]._id,
          checkInTime: Date.now(),
        },
      },
    });

    //update the users in the location
    await GeoFence.findByIdAndUpdate(insidePerimeters[0]._id, {
      $addToSet: { users: data.user._id },
    });
  } else if (
    insidePerimeters[0] &&
    data.user.currentLocation !== insidePerimeters[0]._id
  ) {
    // check if the user is in a Geofence and it isnt thesame as the one hes still checked into
    // check him out of the current location
    await User.findByIdAndUpdate(
      data.user._id,
      {
        currentLocation: insidePerimeters[0]._id,
        $set: { 'locationHistory.$[lastHistory].checkOutTime': Date.now() },
      },
      {
        arrayFilters: [
          { lastHistory: { $eq: { $arrayElemAt: ['$locationHistory', -1] } } },
        ],
        new: true,
      },
    );
    await User.findByIdAndUpdate(data.user._id, {
      $push: {
        locationHistory: {
          location: insidePerimeters[0]._id,
          checkInTime: Date.now(),
        },
      },
    });

    //remove his name from users in current location
    await Geofence.findByIdAndUpdate(data.user.currentLocation, {
      $pull: { users: data.user._id },
    });

    await Geofence.findByIdAndUpdate(insidePerimeters[0]._id, {
      $addToSet: { users: data.user._id },
    });
    //add him to users in new location
    // check him into new location
  } else if (!insidePerimeters[0] && data.user.currentLocation) {
    //if the user is not in any GeoFence but his current location is pointing to a GeoFence

    // change the user current location to null and check him out of that current location
    //remove his name from the list of users in that current location
    await User.findByIdAndUpdate(
      data.user._id,
      {
        currentLocation: null,
        $set: { 'locationHistory.$[lastHistory].checkOutTime': Date.now() },
      },
      {
        arrayFilters: [
          { lastHistory: { $eq: { $arrayElemAt: ['$locationHistory', -1] } } },
        ],
        new: true,
      },
    );
  }
};
