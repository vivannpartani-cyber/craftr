import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: tasks } = await supabase
    .from('agent_tasks')
    .select('*')
    .eq('project_id', id)
    .order('created_at', { ascending: true });

  return NextResponse.json({ tasks: tasks || [] });
}
