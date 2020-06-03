const express = require('express')
const bodyParser = require("body-parser")

const router = express.Router()

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: false }))

router.get('/', (req, res) => {

    res.render('projects');


});
router.get('/single', (req, res) => {

    res.render('project-single');


});
module.exports = router;