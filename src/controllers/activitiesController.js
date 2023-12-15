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

async function createNewActivity(req, res) {
	try {
		const { 
			type_of_activity,
			event_name,
			group_name,
			event_description,
			group_description,
			available_slots,
			slots,
			creator_id,
			monday_start,
			monday_end,
			tuesday_start,
			tuesday_end,
			wednesday_start,
			wednesday_end,
			thursday_start,
			thursday_end,
			friday_start,
			friday_end,
			saturday_start,
			saturday_end
		} = req.body;
		console.log (req.body)
		if ( type_of_activity == "Semillero"){
			const { data, error } = await supabase
				.from("groups")
				.insert([
					{
						group_name: group_name,
						group_description: group_description,
						available_slots: available_slots,
						slots: slots,
						creator_id: creator_id,
						monday_start: monday_start,
						monday_end: monday_end,
						tuesday_start: tuesday_start,
						tuesday_end: tuesday_end,
						wednesday_start: wednesday_start,
						wednesday_end: wednesday_end,
						thursday_start: thursday_start,
						thursday_end: thursday_end,
						friday_start: friday_start,
						friday_end: friday_end,
						saturday_start: saturday_start,
						saturday_end: saturday_end
						
					},
				]);
			if (error) {
				res.status(500).json({ error: error.message });
			}
		}else if ( type_of_activity == "Evento"){
			const { data, error } = await supabase
				.from("events")
				.insert([
					{
						event_name: event_name,
						event_description: event_description,
						available_slots: available_slots,
						slots: slots,
						creator_id: creator_id,
						monday_start: monday_start,
						monday_end: monday_end,
						tuesday_start: tuesday_start,
						tuesday_end: tuesday_end,
						wednesday_start: wednesday_start,
						wednesday_end: wednesday_end,
						thursday_start: thursday_start,
						thursday_end: thursday_end,
						friday_start: friday_start,
						friday_end: friday_end,
						saturday_start: saturday_start,
						saturday_end: saturday_end
						
					},
				]);
			if (error) {
				res.status(500).json({ error: error.message });
			}
		}


		

	} catch {

	}
}

module.exports = {
	makeEnrollment,
	createNewActivity
};
