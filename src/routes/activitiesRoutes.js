const express = require("express");
const router = express.Router();

const {
	makeEnrollment,
	enrolledActivities,
	createNewActivity,
	getEvents,
	getSemilleroById,
    getActivities
} = require("../controllers/activitiesController");

router.post("/activity/enroll", makeEnrollment);
router.post("/activity/list", enrolledActivities);
router.get("/activity/semillero", getSemilleroById)
router.post("/createnewactivity", createNewActivity);
router.get("/events", getEvents);
router.get("/activities", getActivities);

module.exports = router;
