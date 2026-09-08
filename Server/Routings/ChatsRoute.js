const express = require('express');
const router5 = express.Router();
const { requireAuth } = require('../MiddleWares/requireAuth'); 

const { deleteDesktopChats, addDesktopChats } = require('../Controllers/ChatsController');

// 2. Use requireAuth in the routes (Replaced userAuth!)
router5.post('/addDesktopChats', requireAuth, addDesktopChats);
router5.post('/deleteDesktopChats', requireAuth, deleteDesktopChats);

module.exports = router5;