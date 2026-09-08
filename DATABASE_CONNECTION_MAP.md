# TraceSync Database Connection Map

Updated: 2026-09-07

This document describes how the current application connects to the database, which tables are actually used, which features still use MongoDB or memory, and what remains to be implemented.

## 1. Database Stack

The project currently contains two persistence systems:

### Supabase PostgreSQL

Used for the new durable architecture:

- Authentication identity through `auth.users`
- Application profiles
- Workspaces and projects
- Code/visualizer documents
- Document versions
- Recycle-bin records
- Planned chat, visualization, execution, feedback, and storage data

Main configuration:

- Client Supabase client: `Client/src/lib/supabase.js`
- Server Supabase admin client: `Server/Config/supabase.js`
- Schema migration: `supabase/migrations/001_initial_schema.sql`
- Auth profile trigger: `supabase/migrations/002_auth_profile_trigger.sql`
- Atomic document functions: `supabase/migrations/003_document_save_functions.sql`

### MongoDB

Still used by legacy routes and models:

- `Server/Config/mongodb.js`
- `Server/Models/Schema.js`
- `Server/Models/ContactSchema.js`
- `Server/Routings/userDataRoutes.js`
- `Server/Routings/fileRoutes.js`
- `Server/Routings/ChatsRoute.js`
- `Server/Routings/ThemeRoutes.js`
- Legacy authentication routes

MongoDB has not been fully removed.

## 2. Authentication Connection

```text
Client/src/Auth/Register.jsx
  -> Client/src/lib/supabase.js::signUp()
  -> Supabase Auth: auth.users
  -> 002_auth_profile_trigger.sql
  -> public.profiles
  -> Client/src/Context/AppContext.jsx::loadProfile()
```

Login flow:

```text
Client/src/Auth/Login.jsx
  -> Client/src/lib/supabase.js::signIn()
  -> Supabase Auth session
  -> AppContext auth listener
  -> profiles lookup
  -> personal workspace/project bootstrap
```

Profile lookup:

```text
Client/src/Context/AppContext.jsx
  -> supabase.from('profiles').select(...)
```

### Current status

**Partially working**:

- Supabase sign-up and sign-in code exists.
- Auth sessions are persisted in browser storage.
- Profile lookup exists.
- Profile trigger exists in migration 002.
- Workspace/project bootstrap is attempted after login.

**Requires setup/testing**:

- Real `Client/.env` Supabase URL and publishable key.
- Real `Server/.env` service-role secret.
- Migrations 001 and 002 applied.
- Email provider and redirect URLs configured.

**Important**: a client-side demo bypass or missing session can make the UI appear logged in while protected database requests still fail.

## 3. Table-by-Table Connection Map

## `auth.users`

Purpose:

- Supabase-managed identity, login, password, email confirmation, and sessions.

Connected files:

- `Client/src/lib/supabase.js`
- `Client/src/Auth/Login.jsx`
- `Client/src/Auth/Register.jsx`
- `Client/src/Context/AppContext.jsx`
- `supabase/migrations/002_auth_profile_trigger.sql`

Database connection:

```text
signUp/signIn
  -> Supabase Auth
  -> auth.users
  -> profile trigger
```

Status: **Partially working after Supabase setup**.

## `profiles`

Purpose:

- Display name
- Avatar path
- Theme
- Application-level user metadata

Connected files:

- `Client/src/Context/AppContext.jsx`
- `Client/src/lib/workspace.js`
- `supabase/migrations/001_initial_schema.sql`
- `supabase/migrations/002_auth_profile_trigger.sql`

Live query:

```text
AppContext.loadProfile()
  -> supabase.from('profiles').select(...).eq('id', user.id)
```

Status: **Connected for profile loading**.

Remaining work:

- Profile editing should update this table.
- Header/theme still contains legacy Mongo API calls in some versions.
- Avatar upload requires Storage integration.

## `workspaces`

Purpose:

- Personal or shared workspace container.

Connected files:

- `Client/src/lib/workspace.js`
- `Server/Controllers/documentController.js`
- `supabase/migrations/001_initial_schema.sql`

Live client flow:

```text
AppContext.loadProfile()
  -> ensurePersonalProject()
  -> workspace lookup by owner_id
  -> insert workspace if missing
```

Server authorization flow:

```text
Document controller
  -> workspaces lookup
  -> verify owner_id or workspace membership
```

Status: **Partially working**.

Remaining work:

- No dedicated workspace API/UI.
- Membership invitation/management is not connected to the UI.
- Room fallback project/workspace handling needs validation.

## `workspace_members`

Purpose:

- Workspace collaboration roles: owner, editor, viewer.

Connected files:

- `Server/Controllers/documentController.js`
- `supabase/migrations/001_initial_schema.sql`

Live use:

```text
Document controller
  -> workspace_members lookup
  -> role check for owner/editor/viewer
```

Status: **Used for server authorization, not fully productized**.

Remaining work:

- No member-management UI.
- Realtime room authorization is not connected to membership checks.
- Socket.IO connections are currently not authenticated.

## `projects`

Purpose:

- Project container inside a workspace.

Connected files:

- `Client/src/lib/workspace.js`
- `Server/Controllers/documentController.js`
- `supabase/migrations/001_initial_schema.sql`

Live client flow:

```text
ensurePersonalProject()
  -> projects lookup by workspace_id
  -> insert default project if missing
```

Document authorization flow:

```text
document.project_id
  -> projects.workspace_id
  -> workspaces/workspace_members permission check
```

Status: **Partially working**.

Remaining work:

- No project selector.
- No project creation/editing UI.
- The fallback project UUID may not exist and can cause a foreign-key error.

## `documents`

Purpose:

- Current code
- Visual-page state
- Room documents
- Visualizer documents
- Revision number
- Soft-delete state

Connected files:

- `Client/src/lib/documents.js`
- `Client/src/lib/workspace.js`
- `Client/src/hooks/useDocumentAutosave.js`
- `Client/src/pages/EditorPage.jsx`
- `Client/src/Visualizer/VisualizerPage.jsx`
- `Client/src/components/FolderPage.jsx`
- `Client/src/components/GridLayout.jsx`
- `Client/src/components/StrapLayout.jsx`
- `Client/src/components/RecycleBinFolder.jsx`
- `Server/Controllers/documentController.js`
- `Server/Controllers/roomController.js`
- `Server/Routings/documentRoutes.js`
- `Server/Routings/roomRoutes.js`
- `Server/index.js`
- `supabase/migrations/001_initial_schema.sql`
- `supabase/migrations/003_document_save_functions.sql`

### Normal document API path

```text
Client/src/lib/documents.js
  -> Authorization: Bearer <Supabase access token>
  -> /api/documents
  -> Server/Routings/documentRoutes.js
  -> Server/Controllers/documentController.js
  -> Server/Config/supabase.js::supabaseAdmin
  -> public.documents
```

Available operations:

- `GET /api/documents?projectId=...`
- `GET /api/documents/:documentId`
- `POST /api/documents`
- `PATCH /api/documents/:documentId`
- `DELETE /api/documents/:documentId`
- `POST /api/documents/:documentId/restore`
- `GET /api/documents/:documentId/versions`
- `GET /api/documents/recycle-bin/:workspaceId`
- `DELETE /api/documents/recycle-bin/item/:itemId`

### Coding room creation path

```text
Client/src/pages/RoomPage.jsx
  -> POST /api/rooms
  -> Server/Routings/roomRoutes.js
  -> Server/Controllers/roomController.js
  -> supabaseAdmin.from('documents').insert(...)
  -> public.documents
```

Room document values:

- `id`: generated room UUID
- `project_id`: current project or fallback UUID
- `name`: room filename
- `path`: room filename
- `code_content`: starter code

Status: **Connected, but requires valid project and server configuration**.

Security note: the room endpoint currently uses the service-role client and is publicly callable. It should eventually require authentication and verify that the requested project belongs to the caller.

### Coding editor save path

```text
EditorPage.jsx
  -> createDocument()
  -> POST /api/documents
  -> documentController.createDocument()
  -> documents INSERT
```

Then:

```text
useDocumentAutosave.js
  -> saveDocument()
  -> PATCH /api/documents/:documentId
  -> documentController.saveDocument()
  -> save_document_revision() RPC
  -> documents UPDATE
```

Status: **Implemented, but must be tested with a real Supabase session and existing project**.

### Visualizer save path

```text
VisualizerPage.jsx
  -> Yjs + IndexedDB local cache
  -> createDocument()
  -> POST /api/documents
  -> documents INSERT
  -> useDocumentAutosave()
  -> PATCH /api/documents/:documentId
  -> save_document_revision()
  -> documents UPDATE
```

Status: **Implemented in code; requires real auth/project setup**.

## `document_versions`

Purpose:

- Immutable recovery points
- Code history
- Visual-state history

Connected files:

- `Server/Controllers/documentController.js`
- `Server/Controllers/documentController.js::listVersions`
- `supabase/migrations/003_document_save_functions.sql`
- `Client/src/hooks/useDocumentAutosave.js`

Live write path:

```text
PATCH /api/documents/:documentId
  -> save_document_revision RPC
  -> documents row lock
  -> revision check
  -> documents update
  -> document_versions insert
```

Status: **Database/API implemented**.

Remaining work:

- No user-facing version browser.
- No restore-version UI.
- Autosave retention/compaction is not implemented.

## `recycle_bin_items`

Purpose:

- Soft-deleted document records
- Restore window
- Permanent deletion tracking

Connected files:

- `Server/Controllers/documentController.js`
- `Client/src/components/RecycleBinFolder.jsx`
- `Client/src/lib/documents.js`
- `supabase/migrations/001_initial_schema.sql`
- `supabase/migrations/003_document_save_functions.sql`

Live path:

```text
DELETE /api/documents/:documentId
  -> soft_delete_document RPC
  -> documents.deleted_at update
  -> recycle_bin_items insert
```

Read path:

```text
RecycleBinFolder.jsx
  -> GET /api/documents/recycle-bin/:workspaceId
  -> documentController.listRecycleBin()
  -> recycle_bin_items + documents
```

Permanent delete path:

```text
RecycleBinFolder.jsx
  -> DELETE /api/documents/recycle-bin/item/:itemId
  -> documentController.permanentlyDeleteRecycleItem()
  -> documents delete
  -> cascade deletes recycle_bin_items
```

Status: **Connected for document recycle-bin operations**.

Remaining work:

- Restore button/UI should be verified end to end.
- CodeEditor’s old recovery helper still contains legacy Mongo behavior in some revisions.
- Recycle-bin authorization should be tightened for permanent deletion.

## `chat_conversations`

Purpose:

- Durable AI chat conversation containers.

Schema location:

- `supabase/migrations/001_initial_schema.sql`

Current frontend chat paths:

- `Client/src/ChatBox/Chat.jsx`
- `Client/src/ChatBox-Desktop/ChatDesktop.jsx`

Current backend paths:

- `Server/Routings/ChatsRoute.js`
- `Server/Controllers/ChatsController.js`
- `Server/Models/Schema.js`

Current storage:

```text
Chat UI
  -> /api/chats/*
  -> MongoDB embedded allChats
```

Status: **Supabase table is not connected**.

Required work:

- Create conversation API using Supabase.
- Create message API using Supabase.
- Replace embedded MongoDB chat writes.
- Add conversation ownership checks.

## `chat_messages`

Purpose:

- Individual user, assistant, and system messages.

Current storage: **MongoDB embedded chat entries**.

Supabase connection: **Not implemented**.

Required work:

- Migrate chat pairs to `chat_conversations` and `chat_messages`.
- Add message pagination.
- Store provider/model/token metadata.
- Add delete/clear conversation behavior.

## `visualization_sessions`

Purpose:

- Reproducible visualizer execution sessions
- Source code snapshot
- AI visual specification
- Selected visualization engine
- Status and errors

Current visualizer behavior:

- Trace is held in React refs and the Web Worker.
- Visualizer code is saved through `documents`.
- No insert into `visualization_sessions` currently exists.

Status: **Schema-only**.

Required work:

- Insert a session when Run/Visualize begins.
- Save `viz_spec`, engine, status, and error.
- Link session to the visualizer document.
- Add history UI.

## `execution_runs`

Purpose:

- Execution input/output history
- Runtime status
- Exit code
- Duration
- Artifact path

Current execution paths:

- `Client/src/pages/CodeEditor.jsx`
- `Client/src/Visualizer/VisualizerPage.jsx`
- `Server/Routings/codeExecutionRoutes.js`
- External JDoodle execution service

Current storage: **Transient response state only**.

Status: **Schema-only**.

Required work:

- Create an execution row before execution.
- Update it after success/error/timeout.
- Associate it with `document_id` and `user_id`.
- Store large traces in Storage and retain only `artifact_path` in PostgreSQL.

## `feedback`

Purpose:

- Contact and feedback submissions
- Moderation state

Frontend:

- `Client/src/components/Contact.jsx`
- Calls `/api/feedback/addFeedback`

Backend:

- `Server/Routings/ContactRoutes.js`
- `Server/Controllers/ContactController.js`
- `Server/Models/ContactSchema.js`

Current storage: **MongoDB Contact collection**.

Supabase connection: **Not implemented**.

Required work:

- Replace ContactSchema writes with Supabase `feedback` inserts.
- Set `user_id` from verified Supabase identity when available.
- Fix the existing undefined `logoBase64` issue separately.
- Add admin moderation access.

## 4. Storage Buckets

Schema/planning references these buckets:

- `avatars`
- `project-assets`
- `project-exports`
- `execution-artifacts`
- `document-snapshots`

Client helper:

- `Client/src/lib/supabase.js` has `uploadFile`, `getPublicUrl`, and `deleteFile`.

Current status: **Buckets and feature-specific uploads are not fully wired**.

Required work:

- Create buckets in Supabase.
- Add Storage RLS policies.
- Store paths and metadata in PostgreSQL.
- Replace public URLs with signed URLs for private files.

## 5. Realtime and Room Persistence

### Coding collaboration

```text
EditorPage.jsx
  -> Socket.IO join
  -> Server/index.js socket.join(roomid)
  -> CodeEditor Yjs update
  -> Socket.IO yjs-update broadcast
```

This is realtime memory/broadcast behavior, not a database table connection.

### WebRTC lobby

```text
Lobby.jsx
  -> socket.emit('room:join')
  -> Server/index.js
  -> socket.join(room)
  -> MyScreen route
```

This flow currently does **not** create a database document.

### Room database creation

```text
RoomPage.jsx
  -> POST /api/rooms
  -> roomRoutes.js
  -> roomController.js
  -> Supabase documents insert
```

Status: **Coding room creation persists; WebRTC lobby room creation does not**.

## 6. Working Now

With migrations, credentials, and a real authenticated session configured:

- Supabase Auth session handling
- Profile lookup
- Personal workspace/project bootstrap
- Document create/read/list API
- Code document save API
- Optimistic revision checks
- Atomic code and visual-state save RPC
- Document version insertion
- Soft delete and recycle-bin listing
- Permanent document deletion
- Coding room document creation endpoint
- Visualizer local IndexedDB cache
- Visualizer document autosave infrastructure
- Editor document autosave infrastructure
- Workspace document views

## 7. Not Yet Fully Working

- WebRTC Lobby persistence to database
- Chat tables and chat API migration
- Visualization session history
- Execution history
- Feedback table migration
- Storage bucket setup and uploads
- Project/workspace management UI
- Version history UI and version restore
- Authenticated Socket.IO connections
- Realtime membership authorization
- Conflict-free multi-user editing with a CRDT persisted to the server
- Automatic backup/restore test procedure
- Removal of all MongoDB dependencies

## 8. Known Risks and Fixes Needed

### Public room endpoint

`POST /api/rooms` uses the service-role client and currently does not require authentication. Anyone who can reach the endpoint may request a document insert. Add authentication and verify the project belongs to the authenticated user.

### Service-role client

`Server/Config/supabase.js` correctly keeps the service-role key server-side. Never import it into client code.

### Socket.IO autosave

`Server/index.js` still contains a direct `documents.update()` autosave path keyed by `roomid`. The preferred path is the revision-safe `/api/documents/:documentId` save API and `save_document_revision()` RPC. Avoid maintaining both paths long term.

### Legacy Mongo routes

The following APIs still use MongoDB and can overwrite or conflict with Supabase-backed state:

- `/api/userData`
- `/api/file`
- `/api/chats`
- `/api/theme`
- `/api/feedback`
- Legacy `/api/auth` endpoints

## 9. Recommended Next Order

1. Protect `/api/rooms` with Supabase authentication and project authorization.
2. Remove direct Socket.IO database autosave and use revision-safe document saves only.
3. Migrate `CodeEditor` recycle-bin recovery fully to document APIs.
4. Connect `execution_runs` around the execution service.
5. Connect `visualization_sessions` around visualizer Run/Visualize.
6. Migrate chat conversations/messages.
7. Migrate feedback and theme/profile settings.
8. Add Storage buckets and policies.
9. Add workspace/project/member UI.
10. Remove MongoDB after dual-read verification and backup.

## 10. Migration Commands

Run these in Supabase SQL Editor in order:

```text
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_auth_profile_trigger.sql
supabase/migrations/003_document_save_functions.sql
```

Then configure:

- `Client/.env`: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- `Server/.env`: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`

The service-role key must remain server-only.
