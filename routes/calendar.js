const Structure = require('../models/structure')
const Project = require('../models/project')
const Pdf = require('../models/pdfModel')


const fileUpload = require('express-fileupload');
const express = require('express')
const bodyParser = require("body-parser")
const fs = require('fs');
const axios = require('axios');
const url = require('url')

const router = express.Router()

let rawdata = fs.readFileSync('localitati.json');
let localitati = JSON.parse(rawdata);

let renovareRaw = fs.readFileSync('renovare.json');
let listaRenovare = JSON.parse(renovareRaw);

router.use(fileUpload());
router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: false }))

var user;
var proiect;
var valEuro;
var poza;


router.get('/', (req, res) => {

    user = req.user.profile;
    var structs = []

    getExchangeRate('EUR', 'RON').then((data) => {
        valEuro = data
        Structure.find({}, (error, structures) => {
            var tipuri = [];
            var camere = [];
            structs = structures;
            structures.forEach((item) => {
                tipuri.push(item.tip);
                camere.push(item.camere)
            })


        })

        res.render('calendar', {
            Localitati: localitati.Localitati,
            structs,
            listaRenovare: listaRenovare.lucrare,
            preturi: listaRenovare.pretm2,
            valEuro: valEuro,
            unitati: listaRenovare.unitate
        });
    })

});

router.post('/save', async (req, res) => {
    var pdf = new Pdf({
        valEuro: "" + valEuro,
        username: req.body.lname + " " + req.body.fname,
        login: req.user.profile.login,
        address: req.body.localitate + " " + req.body.adresa,
        projectType: req.body.tipProiect,
        building: req.body.tipCladire,
        renovationType: {
            lucrare: req.body.listaRenovare,
            nrUnitati: req.body.listaNrUnitati,
            pretUnitate: req.body.listaPreturi
        },
        constructionType: {
            nrEtaje: req.body.etaje,
            areMansarda: req.body.areMansarda,
            structura: req.body.tipStructura,
            suprafata: req.body.suprafata,
            nrCamere: req.body.nrCamere,
            nrBai: req.body.nrBai,
            stadiu: req.body.tipStadiu,
            plan: poza
        },
        details: req.body.message
    })
    try {

        pdf.save().then((err, post) => {
            console.log("saved")
        })
        res.status(204).send();

    }
    catch {
        res.status(400).json({ message: err.message })
    }

})

router.post('/', (req, res) => {

    const { lname, fname} = req.body;
    res.redirect(url.format({
        pathname: "/pdf",
        query: {
            username: lname + " " + fname
        }
    }));

})

router.post('/upload', (req, res) => {
    try {
        if (!req.files) {
            res.send({
                status: false,
                message: 'No file uploaded'
            });
        } else {
            //Use the name of the input field (i.e. "avatar") to retrieve the uploaded file
            let avatar = req.files.upload;
            poza = avatar.name;
            //Use the mv() method to place the file in upload directory (i.e. "uploads")
            avatar.mv('./public/upload/' + avatar.name);

            //send response
            res.status(204).send();
        }
    } catch (err) {
        res.status(500).send(err);
    }

    
});

router.post('/:id', (req, res, next) => {

    proiect = new Project({
        username: req.body.lname + " " + req.body.fname,
        login: req.user.profile.login,
        address: req.body.localitate + " " + req.body.adresa,
        projectType: req.body.tipProiect,
        building: req.body.tipCladire,
        renovationType: {
            lucrare: req.body.listaRenovare,
            nrUnitati: req.body.listaNrUnitati,
            pretUnitate: req.body.listaPreturi
        },
        constructionType: {
            nrEtaje: req.body.etaje,
            areMansarda: req.body.areMansarda,
            structura: req.body.tipStructura,
            suprafata: req.body.suprafata,
            nrCamere: req.body.nrCamere,
            nrBai: req.body.nrBai,
            stadiu: req.body.tipStadiu,
            plan: poza
        }, details: req.body.message,
        valEuro: valEuro

    })


    try {
        proiect.save().then((err, post) => {
            console.log("u did it")
            let Pusher = require('pusher');
            let pusher = new Pusher({
                appId: process.env.PUSHER_APP_ID,
                key: process.env.PUSHER_APP_KEY,
                secret: process.env.PUSHER_APP_SECRET,
                cluster: process.env.PUSHER_APP_CLUSTER
            });

            pusher.trigger('notifications', 'post_posted', req.body.username, req.headers['x-socket-id']);
            res.status(204).send();
        })

    }
    catch (err) {
        res.status(400).json({ message: err.message })
    }
});



const getExchangeRate = async (fromCurrency, toCurrency) => {
    try {
        const response = await axios.get('http://data.fixer.io/api/latest?access_key=24be1e01a48fc0641da0e826a66f7935');
        const rate = response.data.rates;
        const euro = 1 / rate[fromCurrency];
        const exchangeRate = euro * rate[toCurrency];
        return exchangeRate;
    } catch (error) {
        throw new Error(`Unable to get currency ${fromCurrency} and ${toCurrency}`);
    }
};


module.exports = router;