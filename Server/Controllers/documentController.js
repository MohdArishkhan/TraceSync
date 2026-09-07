const { supabaseAdmin } = require('../Config/supabase');

const getUserId = (req) => req.user?.id;

const getProjectAccess = async (projectId, userId) => {
  const { data: project, error: projectError } = await supabaseAdmin
    .from('projects')
    .select('id, workspace_id')
    .eq('id', projectId)
    .maybeSingle();
  if (projectError) throw projectError;
  if (!project) return null;

  const { data: workspace, error: workspaceError } = await supabaseAdmin
    .from('workspaces')
    .select('id, owner_id')
    .eq('id', project.workspace_id)
    .maybeSingle();
  if (workspaceError) throw workspaceError;
  if (!workspace) return null;
  if (workspace.owner_id === userId) return { ...project, workspace, role: 'owner' };

  const { data: membership, error: membershipError } = await supabaseAdmin
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', workspace.id)
    .eq('user_id', userId)
    .maybeSingle();
  if (membershipError) throw membershipError;
  return membership ? { ...project, workspace, role: membership.role } : null;
};

const requireProjectAccess = async (projectId, userId, canEdit = false) => {
  const access = await getProjectAccess(projectId, userId);
  if (!access || (canEdit && !['owner', 'editor'].includes(access.role))) return null;
  return access;
};

const sendError = (res, error) => {
  const message = error?.message || 'Database request failed';
  const status = message.startsWith('revision_conflict:') ? 409 : 400;
  return res.status(status).json({ success: false, message });
};

const listDocuments = async (req, res) => {
  try {
    const { projectId } = req.query;
    if (!projectId) return res.status(400).json({ success: false, message: 'projectId is required' });
    if (!await requireProjectAccess(projectId, getUserId(req))) return res.status(403).json({ success: false, message: 'Workspace access denied' });

    const { data, error } = await supabaseAdmin
      .from('documents')
      .select('*')
      .eq('project_id', projectId)
      .is('deleted_at', null)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return res.json({ success: true, documents: data });
  } catch (error) {
    return sendError(res, error);
  }
};

const getDocument = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('documents')
      .select('*')
      .eq('id', req.params.documentId)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ success: false, message: 'Document not found' });
    if (!await requireProjectAccess(data.project_id, getUserId(req))) return res.status(403).json({ success: false, message: 'Workspace access denied' });
    return res.json({ success: true, document: data });
  } catch (error) {
    return sendError(res, error);
  }
};

const createDocument = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { projectId, path, name, kind = 'code', language = 'javascript', codeContent = '', visualState = {} } = req.body;
    if (!userId || !projectId || !path || !name) {
      return res.status(400).json({ success: false, message: 'projectId, path, and name are required' });
    }

    const project = await requireProjectAccess(projectId, userId, true);
    if (!project) return res.status(403).json({ success: false, message: 'Workspace edit access denied' });

    const { data, error } = await supabaseAdmin
      .from('documents')
      .insert({ project_id: projectId, path, name, kind, language, code_content: codeContent, visual_state: visualState, last_edited_by: userId })
      .select('*')
      .single();
    if (error) throw error;
    return res.status(201).json({ success: true, document: data });
  } catch (error) {
    return sendError(res, error);
  }
};

const saveDocument = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { baseRevision, codeContent, visualState = {}, message = '', createVersion = true } = req.body;
    if (!userId || !Number.isInteger(baseRevision) || typeof codeContent !== 'string') {
      return res.status(400).json({ success: false, message: 'baseRevision and codeContent are required' });
    }

    const { data, error } = await supabaseAdmin.rpc('save_document_revision', {
      p_document_id: req.params.documentId,
      p_user_id: userId,
      p_base_revision: baseRevision,
      p_code_content: codeContent,
      p_visual_state: visualState,
      p_message: message,
      p_create_version: createVersion
    });
    if (error) throw error;
    return res.json({ success: true, document: Array.isArray(data) ? data[0] : data });
  } catch (error) {
    return sendError(res, error);
  }
};

const deleteDocument = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.rpc('soft_delete_document', {
      p_document_id: req.params.documentId,
      p_user_id: getUserId(req)
    });
    if (error) throw error;
    return res.json({ success: true, deleted: data });
  } catch (error) {
    return sendError(res, error);
  }
};

const listVersions = async (req, res) => {
  try {
    const { data: document, error: documentError } = await supabaseAdmin
      .from('documents').select('project_id').eq('id', req.params.documentId).maybeSingle();
    if (documentError) throw documentError;
    if (!document || !await requireProjectAccess(document.project_id, getUserId(req))) return res.status(403).json({ success: false, message: 'Workspace access denied' });

    const { data, error } = await supabaseAdmin
      .from('document_versions')
      .select('*')
      .eq('document_id', req.params.documentId)
      .order('revision', { ascending: false });
    if (error) throw error;
    return res.json({ success: true, versions: data });
  } catch (error) {
    return sendError(res, error);
  }
};

const listRecycleBin = async (req, res) => {
  try {
    const { data: workspace, error: workspaceError } = await supabaseAdmin
      .from('workspaces').select('owner_id').eq('id', req.params.workspaceId).maybeSingle();
    if (workspaceError) throw workspaceError;
    const { data: membership, error: membershipError } = await supabaseAdmin
      .from('workspace_members').select('role').eq('workspace_id', req.params.workspaceId).eq('user_id', getUserId(req)).maybeSingle();
    if (membershipError) throw membershipError;
    if (!workspace || (workspace.owner_id !== getUserId(req) && !membership)) return res.status(403).json({ success: false, message: 'Workspace access denied' });

    const { data, error } = await supabaseAdmin
      .from('recycle_bin_items')
      .select('*, documents(*)')
      .eq('workspace_id', req.params.workspaceId)
      .is('permanently_deleted_at', null)
      .order('deleted_at', { ascending: false });
    if (error) throw error;
    return res.json({ success: true, items: data });
  } catch (error) {
    return sendError(res, error);
  }
};

const restoreDocument = async (req, res) => {
  try {
    const { data: document, error: documentError } = await supabaseAdmin
      .from('documents').select('project_id').eq('id', req.params.documentId).maybeSingle();
    if (documentError) throw documentError;
    if (!document || !await requireProjectAccess(document.project_id, getUserId(req), true)) return res.status(403).json({ success: false, message: 'Workspace edit access denied' });

    const { data, error } = await supabaseAdmin
      .from('documents')
      .update({ deleted_at: null, updated_at: new Date().toISOString() })
      .eq('id', req.params.documentId)
      .select('*')
      .single();
    if (error) throw error;

    await supabaseAdmin
      .from('recycle_bin_items')
      .update({ permanently_deleted_at: new Date().toISOString() })
      .eq('document_id', req.params.documentId)
      .is('permanently_deleted_at', null);

    return res.json({ success: true, document: data });
  } catch (error) {
    return sendError(res, error);
  }
};

const permanentlyDeleteRecycleItem = async (req, res) => {
  try {
    const { data: item, error: itemError } = await supabaseAdmin
      .from('recycle_bin_items').select('id, document_id, workspace_id').eq('id', req.params.itemId).maybeSingle();
    if (itemError) throw itemError;
    if (!item) return res.status(404).json({ success: false, message: 'Recycle-bin item not found' });

    const { data: workspace, error: workspaceError } = await supabaseAdmin
      .from('workspaces').select('owner_id').eq('id', item.workspace_id).maybeSingle();
    if (workspaceError) throw workspaceError;
    const { data: membership, error: membershipError } = await supabaseAdmin
      .from('workspace_members').select('role').eq('workspace_id', item.workspace_id).eq('user_id', getUserId(req)).maybeSingle();
    if (membershipError) throw membershipError;
    if (!workspace || (workspace.owner_id !== getUserId(req) && membership?.role !== 'owner')) {
      return res.status(403).json({ success: false, message: 'Workspace delete access denied' });
    }

    const { error: deleteError } = await supabaseAdmin.from('documents').delete().eq('id', item.document_id);
    if (deleteError) throw deleteError;
    return res.json({ success: true });
  } catch (error) {
    return sendError(res, error);
  }
};

module.exports = {
  listDocuments,
  getDocument,
  createDocument,
  saveDocument,
  deleteDocument,
  listVersions,
  listRecycleBin,
  restoreDocument,
  permanentlyDeleteRecycleItem
};
