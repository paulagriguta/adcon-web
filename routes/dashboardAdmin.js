const express = require("express");
const router = express.Router();

const Project = require('../models/project')
// Display the dashboard page
router.get("/", async (req, res) => {

    var newProjects = [];
    var acceptedProjects = [];
    var rejectedProjects = [];
    await Project.find({ status: "pending" }, { username: true }).sort({ dateSubmitted: -1 }).exec((err, projects) => {

        projects.forEach((item) => newProjects.push(item))
        // console.log(newProjects);
    });

    await Project.find({ status: "accepted" }, { username: true }).sort({ dateSubmitted: -1 }).exec((err, projects) => {
        projects.forEach((item) => acceptedProjects.push(item))
    });
    await Project.find({ status: "rejected" }, { username: true }).sort({ dateSubmitted: -1 }).exec((err, projects) => {
        projects.forEach((item) => rejectedProjects.push(item))
        res.render("dashboardAdmin", { newProjects: newProjects, acceptedProjects: acceptedProjects, rejectedProjects: rejectedProjects })
    });



});
function Lucrare(lucrare, nrUnitati, pretUnitate) {
    this.lucrare = lucrare;
    this.nrUnitati = nrUnitati;
    this.pretUnitate = pretUnitate;
}
router.get('/:id', (req, res, next) => {
    Project.findOne({ _id: req.params.id }).exec((err, project) => {
     
        const dateTimeFormat = new Intl.DateTimeFormat('UK', { year: 'numeric', month: '2-digit', day: '2-digit' })
        var dateFormatted= dateTimeFormat.format(project.date)
        var projL = project.renovationType;
        var obj;
        var objArray = []
        for (var i = 0; i < projL.lucrare.length; i++) {

            obj = new Lucrare(projL.lucrare[i], projL.nrUnitati[i], "20");

            objArray.push(obj);
        }
        
        res.render('projectAdmin', { project, objArray, dateFormatted });
    });
});

router.post('/:id', (req, res, next) => {
    Project.findByIdAndUpdate(req.params.id, { status: req.body.body }, (err, post) => {

        let Pusher = require('pusher');
        let pusher = new Pusher({
            appId: process.env.PUSHER_APP_ID,
            key: process.env.PUSHER_APP_KEY,
            secret: process.env.PUSHER_APP_SECRET,
            cluster: process.env.PUSHER_APP_CLUSTER
        });

        //   pusher.trigger('notifications', 'post_updated', post, req.headers['x-socket-id']);
        pusher.trigger('updates', 'my_post_updated', post, req.headers['x-socket-id']);
        console.log(pusher)
        res.send('');
    });
});

module.exports = router;