const mongoose = require('mongoose');

const { model, Schema, ObjectId } = mongoose;

const clientProfileSchema = new Schema({
  name: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  users: [{ type: ObjectId, required: true, ref: 'User' }],
  address: { type: String, required: true },
  website: { type: String, unique: true },
  SID: { type: String, required: true, unique: true },
  logo: { type: String, required: true },
});

const ClientProfile = model('ClientProfile', clientProfileSchema);

module.exports = ClientProfile;
