import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Check user auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership
    const { data: project } = await supabase
      .from('projects')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!project || project.user_id !== user.id) {
      return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 });
    }

    // Delete project (cascade delete should handle artifacts and tasks if configured in DB)
    // If not configured, delete them manually first just in case:
    await supabase.from('project_artifacts').delete().eq('project_id', id);
    await supabase.from('agent_tasks').delete().eq('project_id', id);
    
    const { error } = await supabase.from('projects').delete().eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
