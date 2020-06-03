const express = require("express");

const router = express.Router();

// Log a user out
router.get("/logout", (req, res) => {
  if (req.session) {
    // delete session object
    req.session.destroy(function (err) {
      if (err) {
        return next(err);
      } else {
        req.logout();
        res.redirect("/");
      }
    });
  }

});
router.post("/login", (req, res) => {
  if (req.session) {
    res.render('dashboard')
  }

});
module.exports = router;