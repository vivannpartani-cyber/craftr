const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
async function run() {
  const { data: projects } = await supabase.from('projects').select('*').order('created_at', { ascending: false }).limit(2);
  console.log("Projects:", JSON.stringify(projects, null, 2));
  for (const p of projects) {
    const { data: tasks } = await supabase.from('agent_tasks').select('agent_role, status').eq('project_id', p.id);
    console.log(`Tasks for ${p.name}:`, JSON.stringify(tasks));
  }
}
run();
