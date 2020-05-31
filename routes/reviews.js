const Review = require('../models/review')

const express = require('express')
const router = express.Router()
var bodyParser = require("body-parser")

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: false }))

router.get('/', (req, res) => {

    Review.find({}, (error, reviews) => {
        var revs = []
        reviews.forEach((item)=>{revs.push(item.reviewText)})
        console.log(reviews[0].reviewText)

        res.render('reviews', {reviews : revs});
    })
    
});

router.post('/', async (req, res) => {
    console.log("am ajuns aici")
    if (req.user) {
        console.log(req.user)
    }
    const { leaveReview } = req.body;
    
    const review1= new Review({
        reviewText : req.body.leaveReview 
    })
   try {
        
        const review = review1.save()
        res.redirect('/reviews');
    }
    catch (err) {
        res.status(400).json({ message: err.message })
    }

});
module.exports = router;