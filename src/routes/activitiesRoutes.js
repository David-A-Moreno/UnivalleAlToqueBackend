const express = require("express");
const router = express.Router();
const { makeEnrollment, enrolledActivities, getSemilleroById } = require("../controllers/activitiesController");

router.post("/activity/enroll", makeEnrollment);
router.post("/activity/list", enrolledActivities);
router.get("/activity/semillero", getSemilleroById)

module.exports = router;
