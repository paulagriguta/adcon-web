const express = require('express')
const router = express.Router()
const bodyParser = require("body-parser")
const nodemailer = require('nodemailer');

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: false }))

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'adcon.web@gmail.com',
        pass: 'dyxdunmeostmyubi'
    }
});
router.get('/', (req, res) => {
    res.render('contact');
});

router.post('/', async (req, res) => {
    var mailOptions = {
        from: req.body.email,
        to: 'eu.sunt.bob.constructorul@gmail.com',
        subject: req.body.fname + " " + req.body.lname + ': Mesaj Nou',
        text: req.body.message
    };

    try {
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
        res.status(204).send();
    }
    catch (err) {
        res.status(400).json({ message: err.message })
    }

});
module.exports = router;