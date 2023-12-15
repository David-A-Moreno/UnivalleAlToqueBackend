/**
 * Controladores de actividades
 */

const { supabase } = require("../configs/databaseConfig");

// REALIZAR INSCRIPCION DE UN USUARIO A UNA ACTIVIDAD (GRUPO O EVENTO)
async function makeEnrollment(req, res) {
	try {
		const { user_id, activity_id, activity_type } = req.body;

		// Si es un grupo, buscar la informacion del grupo en la base de datos
		if (activity_type == "group") {
			const { data: groupData, error: errorData } = await supabase
				.from("groups")
				.select("*")
				.eq("group_id", activity_id)
				.single();

			const slots = groupData.slots;

			const { data: enrollmentsData, error: errorEnrollments } = await supabase
				.from("enrollments")
				.select("count", { count: "exact" })
				.eq("group_id", activity_id);

			const slots_taken = enrollmentsData[0].count;
			const available_slots = slots - slots_taken;

			if (available_slots > 0) {
				const { data: newEnrollment, error: errorNewEnrollment } = await supabase
					.from("enrollments")
					.insert([
						{
							user_id: user_id,
							group_id: activity_id,
							activity_type: "group",
						},
					]);

				res.status(200).json({ message: "Successfully enrolled" });
			} else {
				res.status(500).json({ error: "There are no free slots" });
			}
		} else if (activity_type == "event") {
			const { data: newEnrollment, error: errorNewEnrollment } = await supabase
				.from("enrollments")
				.insert([
					{
						user_id: user_id,
						event_id: activity_id,
						activity_type: "event",
					},
				]);

			if (errorNewEnrollment) {
				res.status(500).json({ error: errorNewEnrollment.message });
			}

			res.status(200).json({ message: "Successfully enrolled" });
		} else {
			res.status(500).json({ error: "Activity type not provided" });
		}
	} catch (error) {
		res.status(500).json({ error: `${error}` });
	}
}

// OBTENER ACTIVIDADES INSCRITAS DE UN USUARIO
async function enrolledActivities(req, res) {
	try {
		const { user_id } = req.body;

		console.log(user_id);

		//OBTENER ACTIVIDADES INSCRITAS
		const { data: dataList, error: errorList } = await supabase
			.from("enrollments")
			.select("*")
			.eq("user_id", user_id);

		console.log(dataList);

		const activities = [];

		//OBTENER DATOS ADICIONALES DE CADA ACTIVIDAD INSCRITA
		for (const enrollment of dataList) {
			if (enrollment.activity_type == "group" && enrollment.group_id) {
				const { data: groupData, error: groupError } = await supabase
					.from("groups")
					.select("*")
					.eq("group_id", enrollment.group_id)
					.single();

				if (groupData) {
					activities.push({
						group_id: enrollment.group_id,
						group_name: groupData.group_name,
						group_description: groupData.group_description,
						group_photo: groupData.photo,
					});
				}
			} else if (enrollment.activity_type == "event" && enrollment.event_id) {
				const { data: eventData, error: eventError } = await supabase
					.from("events")
					.select("*")
					.eq("event_id", enrollment.event_id)
					.single();

				if (eventData) {
					activities.push({
						event_id: enrollment.event_id,
						event_name: eventData.event_name,
						event_description: eventData.event_description,
						event_photo: eventData.photo,
					});
				}
			}
		}

		console.log(activities);

		res.status(200).json({ message: "Activities sent", activities: activities });
	} catch (error) {
		res.status(500).json({ error: `${error}` });
	}
}

module.exports = {
	makeEnrollment,
	enrolledActivities,
};
