const express = require("express");
const router = express.Router();
const { makeEnrollment, createNewActivity } = require("../controllers/activitiesController");

router.post("/activity/enroll", makeEnrollment);
router.post("/createnewactivity", createNewActivity)

module.exports = router;
