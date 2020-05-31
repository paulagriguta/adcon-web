const mongoose = require('mongoose')

mongoose.Promise = Promise

var Structure = mongoose.model("structuri", {
    tip: String,
    camere: Array
}, "structuri")


module.exports = Structure