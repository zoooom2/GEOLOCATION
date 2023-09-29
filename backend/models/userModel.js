const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const { model, Schema, ObjectId } = mongoose;

const userSchema = new Schema({
  firstname: {
    type: String,
    lowercase: true,
    required: [true, 'Please tell us your first name!'],
  },
  lastname: {
    type: String,
    lowercase: true,
    required: [true, 'Please tell us your last name!'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  phoneNumber: {
    type: String,
    required: [true, 'Please provide your phone number'],
    unique: true,
    validate: {
      validator: (value) => validator.isMobilePhone(value),
      message: '{VALUE} is not a valid mobile phone number',
    },
  },
  companyID: {
    type: ObjectId,
    ref: 'ClientProfile',
  },
  photo: {
    type: String,
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'master'],
    default: 'admin',
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false,
  },
  currentLocation: { type: ObjectId, ref: 'GeoFence', default: null }, // to know where the user is currently
  locationHistory: [
    {
      location: { type: ObjectId, ref: 'GeoFence' },
      checkInTime: { type: Date, required: true },
      checkOutTime: { type: Date, required: true, default: null },
    },
  ],
  passwordConfirm: {
    type: String,
    lowercase: true,
    required: [true, 'Please confirm your password'],
    validate: {
      // This only works on CREATE and SAVE!!!
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same!',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  // this points to the current query
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );

    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = model('User', userSchema);

module.exports = User;
