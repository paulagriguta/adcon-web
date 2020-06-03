const Project = require('../models/project')

const express = require("express");
const axios = require('axios');
const url = require('url')

const router = express.Router();

// Display the dashboard page
router.get("/", async (req, res) => {
  var newProjects = [];
  var acceptedProjects = [];
  var rejectedProjects = [];
  if (req.user.profile.login == 'griguta.paula@gmail.com') {
    res.redirect('/dashboardAdmin');
  }
  else {

    await Project.find({ login: req.user.profile.login, status: "pending" }, { username: true }).sort({ dateSubmitted: -1 }).exec((err, projects) => {
      projects.forEach((item) => newProjects.push(item))
      // console.log(newProjects);
    });

    await Project.find({ login: req.user.profile.login, status: "accepted" }, { username: true }).sort({ dateSubmitted: -1 }).exec((err, projects) => {
      projects.forEach((item) => acceptedProjects.push(item))
    });
    await Project.find({ login: req.user.profile.login, status: "rejected" }, { username: true }).sort({ dateSubmitted: -1 }).exec((err, projects) => {
      projects.forEach((item) => rejectedProjects.push(item))
      res.render("dashboard", { newProjects: newProjects, acceptedProjects: acceptedProjects, rejectedProjects: rejectedProjects })
    });

  }
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
      res.render('project', { project, objArray, dateFormatted });
    }
    else {
      res.render('project', { project, dateFormatted });
    }

  });
});

router.post('/:id', (req, res, next) => {
  Project.findByIdAndUpdate(req.params.id, { projectType: req.body.body }, (err, post) => {

    let Pusher = require('pusher');
    let pusher = new Pusher({
      appId: process.env.PUSHER_APP_ID,
      key: process.env.PUSHER_APP_KEY,
      secret: process.env.PUSHER_APP_SECRET,
      cluster: process.env.PUSHER_APP_CLUSTER
    });

    pusher.trigger('notifications', 'post_updated', post, req.headers['x-socket-id']);
    res.send('');
  });
});


router.post('/:id/pdf', (req, res, next) => {
  res.redirect(url.format({
    pathname: "/pdf",
    query: {
      id: req.body.id
    }
  }));

});


function Lucrare(lucrare, nrUnitati, pretUnitate) {
  this.lucrare = lucrare;
  this.nrUnitati = nrUnitati;
  this.pretUnitate = pretUnitate;
}

module.exports = router;