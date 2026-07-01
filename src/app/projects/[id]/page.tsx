import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import ProjectView from './project-view';

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: project, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !project) notFound();

  return <ProjectView project={project} />;
}
