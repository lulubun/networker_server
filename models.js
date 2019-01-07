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

const jobSchema = mongoose.Schema({
  serUser: String,
  serCompany: {type: String, reuired: true},
  serJobTitle: String,
  serFoundJob: String,
  serNextDate: String,
  serImportant: Boolean,
  serStage: String,
  serContactName: Array,
  serResearch: String,
  serJobNotes: String,
  serWebsite: String,
  serPost: String,
  serPastJobs: Array
});

const JobModel = mongoose.model('JobModel', jobSchema);
const ContactModel = mongoose.model('ContactModel', contactSchema);

module.exports = {ContactModel, JobModel};
