const moment = require('moment');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: doc,
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: doc,
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',

      data: doc,
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    // To allow for nested GET reviews on tour (hack)
    let filter = {};
    if (req.params.productId) filter = { product: req.params.productId };

    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    // const doc = await features.query.explain();
    const doc = await features.query;

    // SEND RESPONSE
    res.status(200).json({
      status: 'success',
      results: doc.length,

      data: doc,
    });
  });

exports.getMine = (Model) =>
  catchAsync(async (req, res) => {
    const data = await Model.find({
      user: req.user.id,
    });
    res.status(200).json({ status: 'success', results: data.length, data });
  });

const aggregator = async (Model, start, stop, period, time, newField) => {
  const groupFields = {
    _id: period[time || 'daily'],
  };

  newField.forEach((property) => {
    groupFields[property.field] = { $sum: property.acc };
  });

  return await Model.aggregate([
    {
      $match: {
        createdAt: {
          $gte: start.toDate(),
          $lte: stop.toDate(),
        },
        $or: [
          { orderStatus: { $exists: false } },
          { orderStatus: { $in: ['completed', 'processing'] } },
        ],
      },
    },
    {
      $addFields: {
        orderItems: {
          $ifNull: ['$orderItems', []],
        },
      },
    },
    {
      $unwind: {
        path: '$orderItems',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $group: groupFields,
    },
  ]);
};
exports.getTotalModelPerTime = (Model, newField) =>
  catchAsync(async (req, res) => {
    const { startTime, endTime, time } = req.query;

    const period = {
      daily: 'day',
      weekly: 'week',
      monthly: 'month',
      yearly: 'year',
    };

    let startOfPeriod;
    let endOfPeriod;

    if (startTime && endTime) {
      startOfPeriod = moment(startTime, 'YYYY-MM-DD');
      endOfPeriod = moment(endTime, 'YYYY-MM-DD');
    } else {
      startOfPeriod = moment().startOf(period[time] || 'day');
      endOfPeriod = moment().endOf(period[time] || 'day');
    }

    const totalAmount = await aggregator(
      Model,
      startOfPeriod,
      endOfPeriod,
      period,
      time,
      newField,
    );
    // eslint-disable-next-line node/no-unsupported-features/es-syntax
    res.status(200).json({ ...totalAmount[0] });
  });

exports.percentageChangeModel = (Model, newField) =>
  catchAsync(async (req, res) => {
    const { time } = req.query;
    const timeRange = {
      daily: 'day',
      weekly: 'week',
      monthly: 'month',
      yearly: 'year',
    };
    const currentTimeStart = moment().startOf(timeRange[time] || 'day');
    const currentTimeEnd = moment().endOf(timeRange[time] || 'day');
    const previousTimeStart = moment()
      .startOf(timeRange[time] || 'day')
      .subtract(1, timeRange[time] || 'day');
    const previousTimeEnd = moment()
      .endOf(timeRange[time] || 'day')
      .subtract(1, timeRange[time] || 'day');

    const currentTime = await aggregator(
      Model,
      currentTimeStart,
      currentTimeEnd,
      timeRange,
      time,
      newField,
    );

    const previousTime = await aggregator(
      Model,
      previousTimeStart,
      previousTimeEnd,
      timeRange,
      time,
      newField,
    );
    let percentageDifference = 0;
    let totalCurrentTime = 0;
    let totalPreviousTime = 0;
    const stats = [];

    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < newField.length; i++) {
      if (currentTime[0]) totalCurrentTime = currentTime[0][newField[i].field];
      if (previousTime[0])
        totalPreviousTime = previousTime[0][newField[i].field];
      percentageDifference = (
        ((totalCurrentTime - totalPreviousTime) / totalPreviousTime) *
        100
      ).toFixed(2);

      stats.push({
        current: totalCurrentTime,
        previous: totalPreviousTime,
        percentageDifference,
      });
    }

    res.status(200).json({
      time,
      stats,
    });
  });
