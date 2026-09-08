-- Atomic document persistence functions.
-- Run after 001_initial_schema.sql and 002_auth_profile_trigger.sql.

CREATE OR REPLACE FUNCTION public.save_document_revision(
  p_document_id uuid,
  p_user_id uuid,
  p_base_revision bigint,
  p_code_content text,
  p_visual_state jsonb,
  p_message text DEFAULT '',
  p_create_version boolean DEFAULT true
)
RETURNS TABLE (
  id uuid,
  project_id uuid,
  path text,
  name text,
  kind text,
  language text,
  code_content text,
  visual_state jsonb,
  revision bigint,
  last_edited_by uuid,
  deleted_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_revision bigint;
  v_can_edit boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM documents d
    JOIN projects p ON p.id = d.project_id
    JOIN workspaces w ON w.id = p.workspace_id
    LEFT JOIN workspace_members wm
      ON wm.workspace_id = w.id AND wm.user_id = p_user_id
    WHERE d.id = p_document_id
      AND d.deleted_at IS NULL
      AND (w.owner_id = p_user_id OR wm.role IN ('owner', 'editor'))
  ) INTO v_can_edit;

  IF NOT v_can_edit THEN
    RAISE EXCEPTION 'document_not_editable';
  END IF;

  SELECT d.revision INTO v_current_revision
  FROM documents d
  WHERE d.id = p_document_id
  FOR UPDATE;

  IF v_current_revision IS NULL THEN
    RAISE EXCEPTION 'document_not_found';
  END IF;

  IF v_current_revision <> p_base_revision THEN
    RAISE EXCEPTION 'revision_conflict:%', v_current_revision;
  END IF;

  UPDATE documents AS d
  SET code_content = p_code_content,
      visual_state = COALESCE(p_visual_state, '{}'::jsonb),
      revision = d.revision + 1,
      last_edited_by = p_user_id,
      updated_at = NOW()
  WHERE d.id = p_document_id;

  IF p_create_version THEN
    INSERT INTO document_versions (
      document_id, revision, code_content, visual_state, created_by, message
    )
    SELECT d.id, d.revision, d.code_content, d.visual_state, p_user_id, COALESCE(p_message, '')
    FROM documents d
    WHERE d.id = p_document_id;
  END IF;

  RETURN QUERY
  SELECT d.id, d.project_id, d.path, d.name, d.kind, d.language,
         d.code_content, d.visual_state, d.revision, d.last_edited_by,
         d.deleted_at, d.created_at, d.updated_at
  FROM documents d
  WHERE d.id = p_document_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.soft_delete_document(
  p_document_id uuid,
  p_user_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_workspace_id uuid;
BEGIN
  SELECT w.id INTO v_workspace_id
  FROM documents d
  JOIN projects p ON p.id = d.project_id
  JOIN workspaces w ON w.id = p.workspace_id
  LEFT JOIN workspace_members wm ON wm.workspace_id = w.id AND wm.user_id = p_user_id
  WHERE d.id = p_document_id
    AND d.deleted_at IS NULL
    AND (w.owner_id = p_user_id OR wm.role IN ('owner', 'editor'));

  IF v_workspace_id IS NULL THEN
    RAISE EXCEPTION 'document_not_deletable';
  END IF;

  UPDATE documents SET deleted_at = NOW(), updated_at = NOW()
  WHERE id = p_document_id;

  INSERT INTO recycle_bin_items (document_id, workspace_id, deleted_by)
  VALUES (p_document_id, v_workspace_id, p_user_id);

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.save_document_revision(uuid, uuid, bigint, text, jsonb, text, boolean) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.soft_delete_document(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.save_document_revision(uuid, uuid, bigint, text, jsonb, text, boolean) TO service_role;
GRANT EXECUTE ON FUNCTION public.soft_delete_document(uuid, uuid) TO service_role;
