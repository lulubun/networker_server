const mongoose = require('mongoose');

const contactSchema = mongoose.Schema({
  serUser: String,
  serNextContact: {type: String, reuired: true},
  serFirst: String,
  serLast: String,
  serImportant: Boolean,
  serCompany: String,
  serJobTitle: String,
  serPhone: String,
  serEmail: String,
  serMeetDate: String,
  serNote: String,
  serPast: Array
});

const ContactModel = mongoose.model('ContactModel', contactSchema);

module.exports = {ContactModel};
