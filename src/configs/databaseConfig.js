const { createClient } = require("@supabase/supabase-js");

// Credenciales supabase
const supabaseUrl = "https://hyliboritykvwyixvojj.supabase.co";
const supabaseKey = process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = {
	supabase,
};
