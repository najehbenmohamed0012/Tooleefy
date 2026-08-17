const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log("Supabase URL:", supabaseUrl);
console.log("Has Key:", !!supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  console.log("Supabase credentials missing in environment variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const { data, error } = await supabase.from('blog_posts').select('*');
  if (error) {
    console.error("Error fetching posts:", error);
  } else {
    console.log("Found posts count:", data?.length);
    console.log("Posts detail:");
    console.log(JSON.stringify(data, null, 2));
  }
}

run();
