/* eslint-disable no-plusplus */
const mongoose = require('mongoose');
const turf = require('@turf/turf');
const Geofence = require('../models/geoFenceModel');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const GeoFence = require('../models/geoFenceModel');

exports.createGeoFence = catchAsync(async (req, res) => {
  const newLocation = await Geofence.create({
    companyID: req.user.companyID,
    polygon: req.body.polygon,
  });
  res.status(201).json(newLocation);
});

exports.getFenceByCompanyID = catchAsync(async (req, res) => {
  const fences = await Geofence.find({
    companyID: new mongoose.Types.ObjectId(req.user.companyID),
  });

  const mappedFences = fences.map((f) => ({
    uid: f._id,
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

  const fence = await GeoFence.findOneAndUpdate({ _id: uid }, update, {
    new: true,
    useFindAndModify: false,
  });

  res.status(200).json(fence);
});

exports.deleteFenceByUID = catchAsync(async (req, res) => {
  const { uid } = req.params;
  const fence = await GeoFence.findOneAndDelete({ _id: uid });
  res.status(200).json(fence);
});

exports.checkLocation = async (data) => {
  // find polygons based on the company the user belongs to
  const companyID = new mongoose.Types.ObjectId(data.user.companyID);

  const polygons = await Geofence.find({
    companyID,
  });

  // check if the position is inside any geofence
  const insidePerimeters = polygons.filter(({ polygon }) =>
    turf.booleanPointInPolygon(
      turf.point([data.latitude, data.longitude]),
      turf.polygon([
        [...polygon.vertices.coordinates, polygon.vertices.coordinates[0]],
      ]),
    ),
  );

  if (insidePerimeters.length === 0) {
    console.log('not inside any territory');
    // User is not inside any geofence
    if (data.user.currentLocation) {
      // User has a current location, so check them out
      await User.findByIdAndUpdate(
        data.user._id,
        {
          currentLocation: null,
          $set: {
            'locationHistory.$[lastHistory].checkOutTime': Date.now(),
          },
        },
        {
          arrayFilters: [
            {
              lastHistory: { $eq: { $arrayElemAt: ['$locationHistory', -1] } },
            },
          ],
          new: true,
        },
      );
      // Remove the user from the list of users in the current location
      await Geofence.findByIdAndUpdate(data.user.currentLocation, {
        $pull: { users: data.user._id },
      });
    }
  } else {
    const newLocationId = insidePerimeters[0]._id;

    if (!data.user.currentLocation) {
      console.log('first timer');
      // User is inside a geofence for the first time
      // Check them into the new location
      await User.findByIdAndUpdate(data.user._id, {
        currentLocation: newLocationId,
        $push: {
          locationHistory: {
            location: newLocationId,
            checkInTime: Date.now(),
          },
        },
      });
      // Add the user to the list of users in the new location
      await Geofence.findByIdAndUpdate(newLocationId, {
        $addToSet: { users: data.user._id },
      });
    } else if (data.user.currentLocation !== newLocationId.toString()) {
      console.log('different current location from the perimeter own');
      // User is inside a different geofence than their current location
      // Check them out from the current location
      await User.findByIdAndUpdate(
        data.user._id,
        {
          currentLocation: newLocationId,
          $set: {
            'locationHistory.$[lastHistory].checkOutTime': Date.now(),
          },
        },
        {
          arrayFilters: [
            {
              lastHistory: { $eq: { $arrayElemAt: ['$locationHistory', -1] } },
            },
          ],
          new: true,
        },
      );
      // Remove the user from the list of users in the current location
      await Geofence.findByIdAndUpdate(data.user.currentLocation, {
        $pull: { users: data.user._id },
      });
      // Check them into the new location
      await User.findByIdAndUpdate(data.user._id, {
        $push: {
          locationHistory: {
            location: newLocationId,
            checkInTime: Date.now(),
          },
        },
      });
      // Add the user to the list of users in the new location
      await Geofence.findByIdAndUpdate(newLocationId, {
        $addToSet: { users: data.user._id },
      });
    }
  }
};
