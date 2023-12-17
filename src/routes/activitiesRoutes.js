const express = require("express");
const router = express.Router();
<<<<<<< HEAD
const { makeEnrollment, enrolledActivities, getSemilleroById } = require("../controllers/activitiesController");

router.post("/activity/enroll", makeEnrollment);
router.post("/activity/list", enrolledActivities);
router.get("/activity/semillero", getSemilleroById)
=======

const {
	makeEnrollment,
	enrolledActivities,
	createNewActivity,
	getEvents,
    getActivities
} = require("../controllers/activitiesController");

router.post("/activity/enroll", makeEnrollment);
router.post("/activity/list", enrolledActivities);
router.post("/createnewactivity", createNewActivity);
router.get("/events", getEvents);
router.get("/activities", getActivities);
>>>>>>> 102566e015b2d0a5423793ab3286344c06915b9e

module.exports = router;
