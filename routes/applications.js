const express = require('express')
const router = express.Router()
const bodyParser = require("body-parser")

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: false }))

router.get('/', (req, res) => {


        res.render('personalProjects');

    
});

module.exports = router;