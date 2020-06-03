const Project = require('../models/project')

const express = require("express");

const router = express.Router();

function Lucrare(lucrare, nrUnitati, pretUnitate) {
    this.lucrare = lucrare;
    this.nrUnitati = nrUnitati;
    this.pretUnitate = pretUnitate;
}

// Display the dashboard page
router.get("/", async (req, res) => {

    var newProjects = [];
    var acceptedProjects = [];
    var rejectedProjects = [];
    await Project.find({ status: "pending" }, { username: true }).sort({ dateSubmitted: -1 }).exec((err, projects) => {

        projects.forEach((item) => newProjects.push(item))
        
    });

    await Project.find({ status: "accepted" }, { username: true }).sort({ dateSubmitted: -1 }).exec((err, projects) => {
        projects.forEach((item) => acceptedProjects.push(item))
    });
    await Project.find({ status: "rejected" }, { username: true }).sort({ dateSubmitted: -1 }).exec((err, projects) => {
        projects.forEach((item) => rejectedProjects.push(item))
        res.render("dashboardAdmin", { newProjects: newProjects, acceptedProjects: acceptedProjects, rejectedProjects: rejectedProjects })
    });



});

router.get('/:id', (req, res, next) => {
    Project.findOne({ _id: req.params.id }).exec((err, project) => {

        const dateTimeFormat = new Intl.DateTimeFormat('UK', { year: 'numeric', month: '2-digit', day: '2-digit' })
        var dateFormatted = dateTimeFormat.format(project.date)
        
        if (project.projectType == 'renovare' && project.renovationType) {
            var projL = project.renovationType;
            var obj;
            var objArray = []

            for (var i = 0; i < projL.lucrare.length; i++) {

                obj = new Lucrare(projL.lucrare[i], projL.nrUnitati[i], "20");

                objArray.push(obj);
            }
            console.log(objArray)
            res.render('projectAdmin', { project, objArray, dateFormatted });
        }
        else {
            res.render('projectAdmin', { project, dateFormatted });
        }
    });
});

router.post('/:id', (req, res, next) => {
    console.log(req.body.body)
    Project.findByIdAndUpdate(req.params.id, { status: req.body.body }, (err, post) => {
        console.log(req.body.body)
        let Pusher = require('pusher');
        let pusher = new Pusher({
            appId: process.env.PUSHER_APP_ID,
            key: process.env.PUSHER_APP_KEY,
            secret: process.env.PUSHER_APP_SECRET,
            cluster: process.env.PUSHER_APP_CLUSTER
        });

       
        pusher.trigger('updates', 'my_post_updated', post, req.headers['x-socket-id']);    
        res.send('');
    });
});

module.exports = router;