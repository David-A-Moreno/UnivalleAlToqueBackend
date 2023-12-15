const express = require("express");
const router = express.Router();
const { makeEnrollment } = require("../controllers/activitiesController");

router.post("/activity/enroll", makeEnrollment);

module.exports = router;
