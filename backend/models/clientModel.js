const { default: mongoose } = require('mongoose');

const { model, Schema, ObjectId } = mongoose;

const ClientProfileSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  users: [{ type: ObjectId, required: true, ref: 'User' }],
  address: { type: String, required: true },
  website: { type: String },
  SID: { type: String, required: true },
  logo: { type: String, required: true },
});

const ClientProfile = model('ClientProfile', ClientProfileSchema);

module.exports = ClientProfile;
