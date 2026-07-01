import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { runForgeOrchestration } from '@/lib/ai/orchestrator';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    
    // Get project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Check user auth (ensure they own it)
    const { data: { user } } = await supabase.auth.getUser();
    if (project.user_id !== user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Reset status to building
    await supabase
      .from('projects')
      .update({ status: 'building' })
      .eq('id', id);

    // Reset any previously failed tasks for this project
    await supabase
      .from('agent_tasks')
      .delete()
      .eq('project_id', id)
      .eq('status', 'failed');

    // Get session to retrieve access token for background worker authentication
    const { data: { session } } = await supabase.auth.getSession();
    const accessToken = session?.access_token;

    // Run in background
    runForgeOrchestration(project.id, project.name, project.idea_description, accessToken);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to retry project:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
