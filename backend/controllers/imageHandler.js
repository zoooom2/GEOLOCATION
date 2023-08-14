const multer = require('multer');
const sharp = require('sharp');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET_KEY,
});

const storage = (location) =>
  new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: `${location} images`,
      allowed_formats: ['jpg', 'png'],
      transformation: [{ width: 500, height: 500, crop: 'limit' }],
      public_id: (req, file) => file.originalname,
    },
  });

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload an image', 400), false);
  }
};

const cloudUpload = (location) =>
  multer({ storage: storage(location), fileFilter: multerFilter });

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.uploadPhoto = ([entry, uploadType], type) => {
  if (uploadType && uploadType === 'multerUpload') {
    return upload.single(entry);
  }

  return cloudUpload(type).single(entry);
};
exports.multiplePhotos = ([entries, uploadType], type) => {
  if (uploadType && uploadType === 'multerUpload') {
    return upload.fields([...entries]);
  }
  return cloudUpload(type).fields([...entries]);
};
exports.multipleSinglePhotos = ([entry, uploadType], type) => {
  if (uploadType && uploadType === 'multerUpload') {
    return upload.array(entry.name, entry.maxCount);
  }
  return cloudUpload(type).array(entry.name, entry.maxCount);
};

exports.resizePhoto = (length, width, name, location) =>
  catchAsync(async (req, res, next) => {
    // console.log(req.file);
    if (!req.file) next();
    const userId = req.user.id;
    const timeStamp = Date.now();

    req.body.images = `${name}-${userId}-${timeStamp}.jpeg`;
    await sharp(req.file.buffer)
      .resize(length, width)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`../../frontend/public/${location}/${req.body.images}`);

    next();
  });

exports.resizeMultiplePhotos = (length, width, name, location) =>
  catchAsync(async (req, res, next) => {
    if (!req.files) next();
    const userId = req.user.id;
    const timeStamp = Date.now();

    req.body.images = [];
    // req.body.images = `${name}-${userId}-${timeStamp}.jpeg`;
    // console.log(req.files);

    await Promise.all(
      req.files.map(async (file, index) => {
        const filename = `${name}-${userId}-${timeStamp}-${index}.jpeg`;
        await sharp(file.buffer)
          .resize(length, width)
          .toFormat('jpeg')
          .jpeg({ quality: 90 })
          .toFile(`../../frontend/public/${location}/${filename}`);

        req.body.images.push(filename);
      }),
    );

    next();
  });
