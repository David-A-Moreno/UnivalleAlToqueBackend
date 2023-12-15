const express = require("express");
const router = express.Router();
const { makeEnrollment, enrolledActivities } = require("../controllers/activitiesController");

router.post("/activity/enroll", makeEnrollment);
router.post("/activity/list", enrolledActivities);

module.exports = router;
