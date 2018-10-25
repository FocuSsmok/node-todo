const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONODB_URI, { useNewUrlParser: true});

module.exports = { mongoose };

// process.env.NODE_ENV == 'production'