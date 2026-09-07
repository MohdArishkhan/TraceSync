import { useCallback, useEffect, useRef, useState } from 'react';
import { saveDocument } from '../lib/documents';

export const useDocumentAutosave = ({ documentId, revision, codeContent, visualState, delay = 1200, enabled = true }) => {
  const [status, setStatus] = useState('saved');
  const [error, setError] = useState(null);
  const latestRevision = useRef(revision);
  const timer = useRef(null);
  const saveSequence = useRef(0);

  useEffect(() => {
    latestRevision.current = revision;
  }, [revision]);

  const flush = useCallback(async () => {
    if (!enabled || !documentId || typeof codeContent !== 'string') return null;
    const sequence = ++saveSequence.current;
    setStatus('saving');
    setError(null);

    try {
      const result = await saveDocument(documentId, {
        baseRevision: latestRevision.current,
        codeContent,
        visualState: visualState || {},
        saveKind: 'autosave',
        createVersion: true
      });
      if (sequence === saveSequence.current) {
        latestRevision.current = result.document.revision;
        setStatus('saved');
      }
      return result.document;
    } catch (saveError) {
      if (sequence === saveSequence.current) {
        setError(saveError);
        setStatus(saveError.message.includes('revision_conflict') ? 'conflict' : 'error');
      }
      return null;
    }
  }, [codeContent, documentId, enabled, visualState]);

  useEffect(() => {
    if (!enabled || !documentId) return undefined;
    setStatus('dirty');
    clearTimeout(timer.current);
    timer.current = setTimeout(flush, delay);
    return () => clearTimeout(timer.current);
  }, [codeContent, delay, documentId, enabled, flush, visualState]);

  return { status, error, flush };
};
