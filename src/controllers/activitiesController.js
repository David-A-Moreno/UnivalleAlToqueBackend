/**
 * Controladores de actividades
 */

const { supabase } = require("../configs/databaseConfig");

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

module.exports = {
	makeEnrollment,
};
