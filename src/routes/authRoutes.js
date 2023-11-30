const express = require("express");
const router = express.Router();
const {
	loginUser,
	loginGoogleUser,
	registerUser,
	users,
	recoverUserByEmail,
	deleteUserAccountCode,
	deleteUserAccountConfirm,
	getCodeByEmail
} = require("../controllers/authController");

router.post("/login", loginUser);
router.post("/logingoogle", loginGoogleUser);
router.post("/register/user", registerUser);
router.get("/users", users);
router.post("/user/recover", recoverUserByEmail); // Nueva ruta para obtener usuario por correo
router.post("/user/delete/code", deleteUserAccountCode);
router.post("/user/delete/confirm", deleteUserAccountConfirm);
router.get("/user/code/:email", getCodeByEmail);;

module.exports = router;
