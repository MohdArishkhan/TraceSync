import { getCurrentUser, supabase } from './supabase';

const getOrCreate = async (table, filter, payload) => {
  const { data: existing, error: readError } = await supabase
    .from(table)
    .select('*')
    .match(filter)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (readError) throw readError;
  if (existing) return existing;

  const { data: created, error: createError } = await supabase
    .from(table)
    .insert(payload)
    .select('*')
    .single();
  if (createError) throw createError;
  return created;
};

export const ensurePersonalProject = async () => {
  const user = await getCurrentUser();
  if (!user) return null;

  const workspace = await getOrCreate(
    'workspaces',
    { owner_id: user.id },
    { owner_id: user.id, name: 'My Workspace', description: 'Personal TraceSync workspace' }
  );

  return getOrCreate(
    'projects',
    { workspace_id: workspace.id },
    { workspace_id: workspace.id, name: 'My Project', language: 'javascript', description: 'Personal Doodle project' }
  ).then((project) => ({ workspace, project }));
};

export const getPersonalProjectDocuments = async (projectId) => {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('project_id', projectId)
    .is('deleted_at', null)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return data || [];
};
