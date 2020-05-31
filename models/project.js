const mongoose = require('mongoose')

const projectsSchema = new mongoose.Schema({

    username: {
        type: String,
        required: true

    },
    login: {
        type: String,
        required: true
    },
    address: {
        type: String
    },
    projectType: {
        type: String,
        required: true
    },
    building: {
        type: String
    },
    renovationType: {
        type: {
            lucrare: [{ type: String }],
            pretUnitate: [{ type: Number }],
            nrUnitati: [{ type: Number }]
        }
    },
    constructionType: {
        type: [{
            nrEtaje: { type: Number },
            areMansarda: { type: Boolean },
            structura: { type: String },
            suprafata: { type: Number },
            nrCamere: { type: Number },
            nrBai: { type: Number },
            stadiu: { type: String }
        }]
    },
    priceTotal: {
        type: Number
    },
    details: {
        type: String
    },
    dateSubmitted:
    {
        type: Date,
        default: Date.now
    },
    status: {
        type: String, 
        default: "pending"

    }

})


module.exports = mongoose.model('Project', projectsSchema)