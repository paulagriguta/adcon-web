const Structure = require('../models/structure')
const Project = require('../models/project')
const Pdf = require('../models/pdfModel')

const express = require('express')
const router = express.Router()
var bodyParser = require("body-parser")
const fs = require('fs');
const axios = require('axios');
const formidable = require('formidable')

let rawdata = fs.readFileSync('localitati.json');
let localitati = JSON.parse(rawdata);

let renovareRaw = fs.readFileSync('renovare.json');
let listaRenovare = JSON.parse(renovareRaw);


router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: false }))
var user;
var proiect;
const url = require('url')
router.get('/', (req, res) => {

    user = req.user.profile;
    var structs = []
    var valEuro;
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
    console.log(req.body)
    getExchangeRate('EUR', 'RON').then((data) => {
        var valEuro = data
        console.log(valEuro)
        var pdf = new Pdf({
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
                stadiu: req.body.stadiu, 
                plan: req.body.fileUploaded
            }, details: req.body.message,
            valEuro: valEuro
    
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

   
})

router.post('/', (req, res) => {

    const { lname, fname, tipProiect, adresa } = req.body;
    console.log("username : " + lname + " " + fname)
    res.redirect(url.format({
        pathname: "/pdf",
        query: {
            username: lname + " " + fname
        }
    }));

})
router.post('/upload', (req, res) => {
    var form = new formidable.IncomingForm();
    //Formidable uploads to operating systems tmp dir by default
    form.uploadDir = "./public/img";       //set upload directory
    form.keepExtensions = true;     //keep file extension

    form.parse(req);

    form.on('fileBegin', function (name, file) {
        file.path = "./public/img" + file.name;
    });

    form.on('file', function (name, file) {
        console.log('Uploaded ' + file.name);
    });

    res.redirect('/my-project');
});

router.post('/:id', (req, res, next) => {

    // console.log(req.body.tipProiect)
    const { lname, fname, tipProiect, adresa } = req.body;

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
            structura: req.body.structura,
            suprafata: req.body.suprafata,
            nrCamere: req.body.nrCamere,
            nrBai: req.body.nrBai,
            stadiu: req.body.stadiu
        }, details: req.body.message

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
            console.log(pusher)
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