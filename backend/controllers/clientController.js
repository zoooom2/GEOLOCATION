const { nanoid } = require('nanoid');
const ClientProfile = require('../models/clientModel');
const catchAsync = require('../utils/catchAsync');

exports.createClient = catchAsync(async (req, res, next) => {
  req.body.SID = nanoid();
  if (req.file) req.body.logo = req.file.filename;
  const clientProfile = await ClientProfile.create({
    name: req.body.name,
    email: req.body.email,
    address: req.body.address,
    logo: req.body.logo,
    website: req.body.website,
    SID: req.body.SID,
  });
  res.status(200).json({ clientProfile });
});
