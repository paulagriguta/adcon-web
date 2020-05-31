const express = require('express');
const router = express.Router();
//router.use(session({secret: 'mySecret', resave: false, saveUninitialized: false}));
var bodyParser = require('body-parser'); //connects bodyParsing middleware
const formidableMiddleware = require('express-formidable');
const formidable = require('formidable')
var path = require('path');     //used for file path
var fs =require('fs-extra');    //File System-needed for renaming file etc


 
router.use(formidableMiddleware());
 
router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: false }))
router.use(express.static(path.join(__dirname, 'public')));
router.get('/',(req, res)=>{

   
});
module.exports = router;