const express = require("express");
const router = express.Router();
const {
	loginUser,
	loginGoogleUser,
	registerUser,
	recoveryPasswordUser,
	currentUser,
	users,
	recoverUserByEmail
} = require("../controllers/authController");
const { verifyToken } = require("../middlewares/authMiddleware");

router.post("/login", loginUser);
router.post("/logingoogle", loginGoogleUser);
router.post("/register/user", registerUser);
router.post("/sendrecoveryemail", recoveryPasswordUser);
router.get("/currentuser", verifyToken, currentUser);
router.get("/users", users);
router.get("/user/:email", recoverUserByEmail); // Nueva ruta para obtener usuario por correo

module.exports = router;
