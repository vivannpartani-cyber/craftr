import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { runForgeOrchestration } from '@/lib/ai/orchestrator';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: projects, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ projects });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { idea, name, customApiKey } = await request.json();

    if (!idea || !name) {
      return NextResponse.json({ error: 'Name and idea are required' }, { status: 400 });
    }

    // Create the project record first
    const { data: project, error } = await supabase
      .from('projects')
      .insert([{ user_id: user.id, name, idea_description: idea, status: 'building' }])
      .select()
      .single();

    if (error) throw error;

    // Get session to retrieve access token for background worker authentication
    const { data: { session } } = await supabase.auth.getSession();
    const accessToken = session?.access_token;

    // Fire-and-forget: run the orchestration in the background
    // We don't await this so the user gets an instant response
    runForgeOrchestration(project.id, project.name, project.idea_description, accessToken, customApiKey)
      .catch(err => console.error('[Forge] Orchestration failed:', err));

    return NextResponse.json({ project }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
