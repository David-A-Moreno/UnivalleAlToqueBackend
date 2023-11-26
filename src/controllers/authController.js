/**
 * Controladores de autenticacion, manejo de las cuentas de usuario
 */

const {
	getUserByEmail,
	getUsers,
	insertUser,
	updatePasswordUser,
	searchUser,
	insertGoogleUser,
} = require("../models/UsersModel");
const { insertCode } = require("../models/CodesModel");
const { verifyTokenGoogle } = require("../middlewares/authMiddleware");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const secretKey = process.env.SECRET_KEY_JWT;
const nodemailer = require("nodemailer");

const { supabase } = require("../configs/databaseConfig");

// Configura el transporte de nodemailer con tus credenciales de Gmail
const transporter = nodemailer.createTransport({
	service: "gmail",
	host: "smtp.gmail.com",
	port: 465,
	secure: true,
	auth: {
		user: "romainteractiva@gmail.com",
		pass: "moqkwrtblblthnaw",
	},
});

//POST para el inicio de sesion de los usuarios
async function loginUser(req, res) {
	try {
		// Datos obtenidos por el frontend
		const { email, password } = req.body;

		// Realizar la consulta para obtener todos los datos del usuario en la base de datos
		const userData = await getUserByEmail(email);

		// Verificar si el usuario no esta desactivado
		if (userData.status != "active") {
			throw new Error("Credenciales de inicio de sesión inválidas");
		}

		// Verificar el hash de la contraseña
		const passwordHash = userData.password;

		// Comparar el hash almacenado con el hash de la contraseña proporcionada por el usuario
		const match = await bcrypt.compare(password, passwordHash);

		// Si las contraseñas no coinciden, se envía una respuesta de error
		if (!match) {
			throw new Error("Credenciales de inicio de sesión inválidas");
		}

		const user = {
			user_id: userData.user_id,
			email: userData.email,
		};

		console.log("user", user, "userData", userData);
		// Generar token JWT con el user_id email y nickname del usuario
		const token = jwt.sign(user, secretKey);

		// Enviar el token al frontend con los datos del usuario y un mensaje de confirmacion
		res.json({ userData, token, message: "Inicio de sesión exitoso" });
	} catch (error) {
		//console.error("Error al iniciar sesión:", error);
		res.status(500).json({ error: "Credenciales de inicio de sesión inválidas" });
	}
}

//POST LOGIN WITH GOOGLE
async function loginGoogleUser(req, res) {
	try {
		const { credentialResponse } = req.body;

		const clientId = credentialResponse.clientId;
		const credential = credentialResponse.credential;

		// Verificar el token con la función verifyTokenGoogle
		const payload = await verifyTokenGoogle(clientId, credential);

		//Obtener datos del usuario
		const { email, name, picture, given_name } = payload;

		//Email a verificar si ya existe en la base de datos
		const emailToCheck = email;

		try {
			//Consulta para verificar si el email existe en la base de datos
			const verifyExistenceUser = await searchUser(emailToCheck);

			//Si el correo electrónico NO está registrado en la tabla
			if (verifyExistenceUser.length == 0) {
				const registerUser = await insertGoogleUser(email, given_name, name);
				console.log(registerUser);
			}
		} catch (error) {
			console.error("Error en la consulta:", error);
		}

		const usuarioData = await getUserByEmail(email);

		//Datos para poner en el token
		const user = {
			user_id: usuarioData.user_id,
			email: usuarioData.email,
			nickname: usuarioData.nickname,
		};

		// Generar token JWT con el user_id email y nickname del usuario
		const token = jwt.sign(user, secretKey);

		// Enviar el token al frontend con los datos del usuario y un mensaje de confirmacion
		res.json({ usuarioData, token, message: "Inicio de sesión exitoso" });
	} catch (error) {
		console.error("Error al iniciar sesión:", error);
		res.status(500).json({ error: "Credenciales de inicio de sesión inválidas" });
	}
}

async function generateSendCode(req, res) {}

// Ruta para enviar el correo electrónico
async function recoveryPasswordUser(req, res) {
	// const { to, subject, body } = req.body;
	// newData = {};
	// newData["contrasena"] = Math.random().toString(36).slice(-8);
	// const mailOptions = {
	// 	from: "romainteractiva@gmail.com",
	// 	to,
	// 	subject,
	// 	html: body + newData["contrasena"],
	// };
	// newData["contrasena"] = await bcrypt.hash(newData["contrasena"], 10);
	// const newPassword = await updatePasswordUser(to);
	// // Envía el correo electrónico utilizando nodemailer
	// transporter.sendMail(mailOptions, (error, info) => {
	// 	if (error) {
	// 		console.error("Error al enviar el correo electrónico:", error);
	// 		res.status(500).json("Ocurrió un error al enviar el correo electrónico");
	// 	} else {
	// 		console.log("Correo electrónico enviado:", info.response);
	// 		res.status(200).json({ message: "Correo electrónico enviado exitosamente" });
	// 	}
	// });
}

//POST para el registro de usuarios
async function registerUser(req, res) {
	try {
		//Datos de registro del usuario recibidos
		const { name, last_name, email, password } = req.body;

		// Generar el hash de la contraseña
		const hashedPassword = await bcrypt.hash(password, 10); // 10 es el número de rondas de hashing

		const data = await insertUser(name, last_name, email, hashedPassword);

		//Respuesta
		res.json("OK");
	} catch (error) {
		console.error("Error al crear el usuario:", error);
		res.status(500).json({ error: error.message });
	}
}

async function currentUser(req, res) {
	const userId = req.user.user_id;
	const email = req.user.email;
	const username = req.user.nickname;

	console.log("INFO TOKEN:", userId, email, username);

	res.json({ userId, email, username });
}

// // Obtener informacion de todos los usuarios de la base de datos
async function users(req, res) {
	const data = await getUsers();
	//Respuesta
	res.json(data);
}

async function recoverUserByEmail(req, res) {
	try {
		const email = req.params.email;
		//SEARCH IF THE USER EXISTS
		const { data, error } = await supabase.from("users").select("*").eq("email", email).single();

		// IF USER DOESNT EXIST
		if (error) {
			throw error;
		}

		//CREATE AND SEND CODE IF USER EXISTS

		//Code types: delete_account, recover_password, change_password
		const { type } = req.body;

		const randomCode = Math.floor(1000 + Math.random() * 9000);

		const currentDate = new Date();

		// Calcular la fecha de expiración (15 minutos después)
		const expirationDate = new Date(currentDate.getTime() + 15 * 60000); // 15 minutos en milisegundos

		const creationDate = currentDate.toISOString(); // Fecha y hora de creación
		const expirationDateString = expirationDate.toISOString(); // Fecha y hora de expiración

		message_type = "";

		if (type == "delete_account") {
			message_type = " para eliminar su cuenta es: ";
		} else if (type == "recover_password") {
			message_type = " para recuperar su contraseña es: ";
		} else if (type == "change_password") {
			message_type = " para cambiar su contraseña es: ";
		}

		const insert = await insertCode(
			creationDate,
			expirationDateString,
			randomCode,
			data.user_id,
			type
		);

		console.log(email, type);

		// Define el contenido del correo electrónico
		const mailOptions = {
			from: "univallealtoque@gmail.com",
			to: email,
			subject: "Univalle AlToque - Código de verificación",
			text:
				"Estimado usuario, \nEl código de verificación" +
				`${message_type}` +
				`${randomCode}` +
				"\nEl código tiene una vigencia de 15 minutos.",
		};

		// Envia el correo electrónico
		transporter.sendMail(mailOptions, (error, info) => {
			if (error) {
				res.status(500).json({ message: "Error sending email" });
				console.log("Error al enviar el correo electrónico:", error);
			} else {
				// res.status(200).json({ message: "Email sent successfully" });
				console.log("Correo electrónico enviado:", info.response);
			}
		});

		// Enviar los datos del usuario como respuesta
		res.json(data);
	} catch (error) {
		console.error("Error al obtener usuario por correo:", error);
		res.status(500).json({ error: "Error al obtener usuario por correo" });
	}
}

module.exports = {
	loginUser,
	loginGoogleUser,
	registerUser,
	recoveryPasswordUser,
	currentUser,
	users,
	recoverUserByEmail,
	generateSendCode,
};
