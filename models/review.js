const mongoose = require('mongoose')

const reviewsSchema = new mongoose.Schema({

    username: { 
        type: String,
        
    },
    reviewText: {
        type: String,
        required: true
    }

})


module.exports = mongoose.model('Review', reviewsSchema)