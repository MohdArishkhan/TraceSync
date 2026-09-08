-- TraceSync Database Schema Migration
-- Created: 2026-09-07
-- Description: Initial Supabase schema for durable persistence

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- PROFILES TABLE
-- ============================================================================
-- Extends Supabase Auth users with application-specific profile data
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_path TEXT,
  theme TEXT DEFAULT 'dark' CHECK (theme IN ('dark', 'light')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- RLS Policies for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- WORKSPACES TABLE
-- ============================================================================
-- A workspace is a container for projects (personal or shared)
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (LENGTH(name) > 0 AND LENGTH(name) <= 200),
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_workspaces_owner ON workspaces(owner_id, updated_at DESC);

-- RLS Policies
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- WORKSPACE_MEMBERS TABLE
-- ============================================================================
-- Manages collaboration and permissions for workspaces
CREATE TABLE workspace_members (
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('owner', 'editor', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (workspace_id, user_id)
);

-- Indexes
CREATE INDEX idx_workspace_members_user ON workspace_members(user_id, workspace_id);

-- RLS Policies
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view workspace memberships"
  ON workspace_members FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM workspaces w
      WHERE w.id = workspace_members.workspace_id AND w.owner_id = auth.uid()
    )
  );

CREATE POLICY "Workspace owners can manage members"
  ON workspace_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE id = workspace_members.workspace_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their workspaces"
  ON workspaces FOR SELECT
  USING (
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_id = workspaces.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own workspaces"
  ON workspaces FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can update their workspaces"
  ON workspaces FOR UPDATE
  USING (owner_id = auth.uid());

CREATE POLICY "Owners can delete their workspaces"
  ON workspaces FOR DELETE
  USING (owner_id = auth.uid());

-- ============================================================================
-- PROJECTS TABLE
-- ============================================================================
-- A project is a collection of documents within a workspace
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (LENGTH(name) > 0 AND LENGTH(name) <= 200),
  language TEXT DEFAULT 'javascript',
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_projects_workspace ON projects(workspace_id, updated_at DESC);

-- RLS Policies
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view projects in their workspaces"
  ON projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workspaces w
      WHERE w.id = projects.workspace_id AND (
        w.owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM workspace_members wm
          WHERE wm.workspace_id = w.id AND wm.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Workspace owners and editors can create projects"
  ON projects FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspaces w
      LEFT JOIN workspace_members wm ON wm.workspace_id = w.id AND wm.user_id = auth.uid()
      WHERE w.id = workspace_id AND (
        w.owner_id = auth.uid() OR
        wm.role IN ('owner', 'editor')
      )
    )
  );

CREATE POLICY "Workspace owners and editors can update projects"
  ON projects FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM workspaces w
      LEFT JOIN workspace_members wm ON wm.workspace_id = w.id AND wm.user_id = auth.uid()
      WHERE w.id = workspace_id AND (
        w.owner_id = auth.uid() OR
        wm.role IN ('owner', 'editor')
      )
    )
  );

CREATE POLICY "Workspace owners can delete projects"
  ON projects FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM workspaces w
      WHERE w.id = workspace_id AND w.owner_id = auth.uid()
    )
  );

-- ============================================================================
-- DOCUMENTS TABLE
-- ============================================================================
-- Core table for code files and visual pages with revision tracking
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  path TEXT NOT NULL CHECK (LENGTH(path) > 0 AND LENGTH(path) <= 500),
  name TEXT NOT NULL CHECK (LENGTH(name) > 0 AND LENGTH(name) <= 255),
  kind TEXT NOT NULL DEFAULT 'code' CHECK (kind IN ('code', 'visual_page', 'mixed')),
  language TEXT DEFAULT 'javascript',
  code_content TEXT NOT NULL DEFAULT '',
  visual_state JSONB NOT NULL DEFAULT '{}'::jsonb,
  revision BIGINT NOT NULL DEFAULT 0,
  last_edited_by UUID REFERENCES profiles(id),
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_documents_project ON documents(project_id, deleted_at, updated_at DESC);
CREATE INDEX idx_documents_editor ON documents(last_edited_by, updated_at DESC);
CREATE INDEX idx_documents_deleted ON documents(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE UNIQUE INDEX idx_documents_active_path
  ON documents(project_id, path)
  WHERE deleted_at IS NULL;

-- RLS Policies
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view documents in their workspaces"
  ON documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      JOIN workspaces w ON w.id = p.workspace_id
      WHERE p.id = documents.project_id AND (
        w.owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM workspace_members wm
          WHERE wm.workspace_id = w.id AND wm.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Editors can create documents"
  ON documents FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects p
      JOIN workspaces w ON w.id = p.workspace_id
      LEFT JOIN workspace_members wm ON wm.workspace_id = w.id AND wm.user_id = auth.uid()
      WHERE p.id = project_id AND (
        w.owner_id = auth.uid() OR
        wm.role IN ('owner', 'editor')
      )
    )
  );

CREATE POLICY "Editors can update documents"
  ON documents FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      JOIN workspaces w ON w.id = p.workspace_id
      LEFT JOIN workspace_members wm ON wm.workspace_id = w.id AND wm.user_id = auth.uid()
      WHERE p.id = project_id AND (
        w.owner_id = auth.uid() OR
        wm.role IN ('owner', 'editor')
      )
    )
  );

CREATE POLICY "Editors can soft-delete documents"
  ON documents FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      JOIN workspaces w ON w.id = p.workspace_id
      LEFT JOIN workspace_members wm ON wm.workspace_id = w.id AND wm.user_id = auth.uid()
      WHERE p.id = project_id AND (
        w.owner_id = auth.uid() OR
        wm.role IN ('owner', 'editor')
      )
    )
  );

-- ============================================================================
-- DOCUMENT_VERSIONS TABLE
-- ============================================================================
-- Immutable version history for recovery
CREATE TABLE document_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  revision BIGINT NOT NULL,
  code_content TEXT NOT NULL,
  visual_state JSONB NOT NULL,
  created_by UUID REFERENCES profiles(id),
  message TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT unique_document_revision UNIQUE (document_id, revision)
);

-- Indexes
CREATE INDEX idx_versions_document ON document_versions(document_id, created_at DESC);
CREATE INDEX idx_versions_revision ON document_versions(document_id, revision DESC);

-- RLS Policies
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view versions of documents they can access"
  ON document_versions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM documents d
      JOIN projects p ON p.id = d.project_id
      JOIN workspaces w ON w.id = p.workspace_id
      WHERE d.id = document_versions.document_id AND (
        w.owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM workspace_members wm
          WHERE wm.workspace_id = w.id AND wm.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "System can insert versions"
  ON document_versions FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- RECYCLE_BIN_ITEMS TABLE
-- ============================================================================
-- Soft-deleted documents with recovery window
CREATE TABLE recycle_bin_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  deleted_by UUID REFERENCES profiles(id),
  deleted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  restore_until TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
  permanently_deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_recycle_workspace ON recycle_bin_items(workspace_id, deleted_at DESC);
CREATE INDEX idx_recycle_expiry ON recycle_bin_items(restore_until) WHERE permanently_deleted_at IS NULL;

-- RLS Policies
ALTER TABLE recycle_bin_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view recycle bin in their workspaces"
  ON recycle_bin_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workspaces w
      WHERE w.id = workspace_id AND (
        w.owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM workspace_members wm
          WHERE wm.workspace_id = w.id AND wm.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "System can manage recycle bin"
  ON recycle_bin_items FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- CHAT_CONVERSATIONS TABLE
-- ============================================================================
-- Chat conversation containers
CREATE TABLE chat_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'New Conversation',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_conversations_user ON chat_conversations(user_id, updated_at DESC);
CREATE INDEX idx_conversations_workspace ON chat_conversations(workspace_id, updated_at DESC);

-- RLS Policies
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their conversations"
  ON chat_conversations FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their conversations"
  ON chat_conversations FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their conversations"
  ON chat_conversations FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their conversations"
  ON chat_conversations FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================================
-- CHAT_MESSAGES TABLE
-- ============================================================================
-- Individual messages in conversations
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  provider TEXT DEFAULT 'gemini',
  model TEXT,
  tokens_used INTEGER,
  latency_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_messages_conversation ON chat_messages(conversation_id, created_at ASC);

-- RLS Policies
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in their conversations"
  ON chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_conversations cc
      WHERE cc.id = conversation_id AND cc.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in their conversations"
  ON chat_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_conversations cc
      WHERE cc.id = conversation_id AND cc.user_id = auth.uid()
    )
  );

-- ============================================================================
-- VISUALIZATION_SESSIONS TABLE
-- ============================================================================
-- Stores reproducible visualizer work
CREATE TABLE visualization_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  source_code TEXT NOT NULL,
  language TEXT NOT NULL,
  viz_spec JSONB,
  selected_engine TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'error')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_viz_sessions_document ON visualization_sessions(document_id, created_at DESC);
CREATE INDEX idx_viz_sessions_user ON visualization_sessions(user_id, created_at DESC);

-- RLS Policies
ALTER TABLE visualization_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their visualization sessions"
  ON visualization_sessions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their visualization sessions"
  ON visualization_sessions FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- EXECUTION_RUNS TABLE
-- ============================================================================
-- Stores code execution metadata
CREATE TABLE execution_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  language TEXT NOT NULL,
  stdin TEXT DEFAULT '',
  status TEXT NOT NULL CHECK (status IN ('pending', 'running', 'success', 'error', 'timeout')),
  stdout TEXT,
  stderr TEXT,
  exit_code INTEGER,
  duration_ms INTEGER,
  artifact_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_execution_document ON execution_runs(document_id, created_at DESC);
CREATE INDEX idx_execution_user ON execution_runs(user_id, created_at DESC);

-- RLS Policies
ALTER TABLE execution_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their execution runs"
  ON execution_runs FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their execution runs"
  ON execution_runs FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- FEEDBACK TABLE
-- ============================================================================
-- Replaces the Contact collection
CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'spam')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_feedback_status ON feedback(status, created_at DESC);
CREATE INDEX idx_feedback_user ON feedback(user_id, created_at DESC);

-- RLS Policies
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own feedback"
  ON feedback FOR SELECT
  USING (user_id = auth.uid() OR auth.uid() IS NULL);

CREATE POLICY "Anyone can submit feedback"
  ON feedback FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workspaces_updated_at BEFORE UPDATE ON workspaces
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_conversations_updated_at BEFORE UPDATE ON chat_conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feedback_updated_at BEFORE UPDATE ON feedback
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- STORAGE BUCKETS (Run these via Supabase Dashboard or API)
-- ============================================================================
-- These are commented as they need to be created via Supabase Dashboard/API
--
-- 1. avatars (private)
-- 2. project-assets (private, workspace-scoped)
-- 3. project-exports (private, workspace-scoped)
-- 4. execution-artifacts (private, user-scoped)
