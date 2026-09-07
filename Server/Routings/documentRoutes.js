const express = require('express');
const {
  listDocuments,
  getDocument,
  createDocument,
  saveDocument,
  deleteDocument,
  listVersions,
  listRecycleBin,
  restoreDocument,
  permanentlyDeleteRecycleItem
} = require('../Controllers/documentController');
const { authenticateUser } = require('../Config/supabase');

const router = express.Router();

router.use(authenticateUser);
router.get('/', listDocuments);
router.post('/', createDocument);
router.get('/recycle-bin/:workspaceId', listRecycleBin);
router.delete('/recycle-bin/item/:itemId', permanentlyDeleteRecycleItem);
router.get('/:documentId', getDocument);
router.patch('/:documentId', saveDocument);
router.delete('/:documentId', deleteDocument);
router.post('/:documentId/restore', restoreDocument);
router.get('/:documentId/versions', listVersions);

module.exports = router;
