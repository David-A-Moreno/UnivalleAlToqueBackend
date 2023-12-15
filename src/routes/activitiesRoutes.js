const express = require("express");
const router = express.Router();

const { makeEnrollment, enrolledActivities, createNewActivity } = require("../controllers/activitiesController");

router.post("/activity/enroll", makeEnrollment);
router.post("/activity/list", enrolledActivities);
router.post("/createnewactivity", createNewActivity)


module.exports = router;
