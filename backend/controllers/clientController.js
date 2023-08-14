const crypto = require('crypto');
const ClientProfile = require('../models/clientModel');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');
const { getAll, getOne } = require('./handlerFactory');

exports.createClient = catchAsync(async (req, res, next) => {
  //   req.body.SID = nanoid(12);
  const uuid = await crypto.randomUUID({ disableEntropyCache: true });

  const clientProfile = await ClientProfile.create({
    name: req.body.name,
    email: req.body.email,
    address: req.body.address,
    users: [req.user.id],
    logo: req.file.path,
    website: req.body.website,
    SID: uuid,
  });

  if (clientProfile)
    await User.findByIdAndUpdate(req.user.id, { companyID: clientProfile._id });

  res.status(201).json({ clientProfile });
});

exports.getClientBySID = catchAsync(async (req, res, next) => {
  const client = await ClientProfile.findOne({ SID: req.body.SID });
  res.status(200).json({ client });
});

exports.getAllClients = getAll(ClientProfile);
exports.getClient = getOne(ClientProfile);
