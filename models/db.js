const mongoose = require('mongoose')
const mongoURI
mongoose.set('debug',true)
mongoose.Promise = Promise

mongoose.connect(mongoURI,{
    useUnifiedTopology:true,
    keepAlive: true,
    useNewUrlParser: true
},)

module.exports.User = require('./model');

