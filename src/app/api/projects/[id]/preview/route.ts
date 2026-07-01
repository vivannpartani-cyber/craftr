import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new NextResponse('Unauthorized', { status: 401 });

  // Fetch the website_builder artifact
  const { data: artifact } = await supabase
    .from('project_artifacts')
    .select('content')
    .eq('project_id', id)
    .eq('artifact_type', 'website_builder')
    .single();

  if (!artifact?.content?.html) {
    return new NextResponse(
      '<html><body style="background:#111;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif"><h1>Website is still being generated...</h1></body></html>',
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }

  return new NextResponse(artifact.content.html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
