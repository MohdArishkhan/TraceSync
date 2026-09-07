import { getSession } from './supabase';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const request = async (path, options = {}) => {
  const session = await getSession();
  if (!session?.access_token) throw new Error('You must be signed in.');

  const response = await fetch(`${BACKEND_URL}/api/documents${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
      ...(options.headers || {})
    }
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || `Document request failed (${response.status})`);
  return payload;
};

export const listDocuments = (projectId) => request(`?projectId=${encodeURIComponent(projectId)}`);
export const getDocument = (documentId) => request(`/${documentId}`);
export const createDocument = (document) => request('', {
  method: 'POST',
  body: JSON.stringify(document)
});
export const saveDocument = (documentId, payload) => request(`/${documentId}`, {
  method: 'PATCH',
  body: JSON.stringify(payload)
});
export const deleteDocument = (documentId) => request(`/${documentId}`, { method: 'DELETE' });
export const restoreDocument = (documentId) => request(`/${documentId}/restore`, { method: 'POST' });
export const listDocumentVersions = (documentId) => request(`/${documentId}/versions`);
export const listRecycleBin = (workspaceId) => request(`/recycle-bin/${workspaceId}`);
export const permanentlyDeleteRecycleItem = (itemId) => request(`/recycle-bin/item/${itemId}`, { method: 'DELETE' });
