var ProductionURL = //'mongodb://networker:networkerpassword@ds155080.mlab.com:55080/networkerdb';

exports.DATABASE_URL = ProductionURL ||
  process.env.DATABASE_URL ||
  global.DATABASE_URL ||
  'mongodb://localhost/networker2';

exports.PORT = process.env.PORT || 8080;
