import { createClient } from "@supabase/supabase-js";


const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing environment variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Testing RLS for unauthenticated access...");
  
  // Test reading repositories
  const { data: repos, error: reposError } = await supabase.from("repositories").select("*").limit(1);
  console.log("Repositories read:", repos ? repos.length : 0, reposError ? reposError.message : "OK");

  // Test reading tasks
  const { data: tasks, error: tasksError } = await supabase.from("maintenance_tasks").select("*").limit(1);
  console.log("Tasks read:", tasks ? tasks.length : 0, tasksError ? tasksError.message : "OK");

  // Test reading profiles
  const { data: profiles, error: profilesError } = await supabase.from("profiles").select("*").limit(1);
  console.log("Profiles read:", profiles ? profiles.length : 0, profilesError ? profilesError.message : "OK");

  console.log("Done.");
}

test();
