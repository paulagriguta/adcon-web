const mongoose = require('mongoose')

const pdfSchema = new mongoose.Schema({

    username: {
        type: String,
        required: true

    },
    login: {
        type: String,
        default: ""
    },
    address: {
        type: String,
        default: ""
    },
    projectType: {
        type: String,
        default: "constructie"

    },
    building: {
        type: String,
        default: ""
    },
    renovationType: {
        type: {
            lucrare: [{ type: String }],
            pretUnitate: [{ type: Number }],
            nrUnitati: [{ type: Number }]
        }
    },
    constructionType: {
        type: {
            nrEtaje: { type: Number },
            areMansarda: { type: Boolean },
            structura: { type: String },
            suprafata: { type: Number },
            nrCamere: { type: Number },
            nrBai: { type: Number },
            stadiu: { type: String },
            plan: { type: String }
        }
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

    },
    valEuro: {
        type: Number,
        default: "4.84",
        required: true
    }

})


module.exports = mongoose.model('Pdf', pdfSchema)