const express = require('express');
const router5 = express.Router();
const userAuth = require('../MiddleWares/userAuth');
const { deleteDesktopChats, addDesktopChats } = require('../Controllers/ChatsController');

router5.post('/addDesktopChats',userAuth, addDesktopChats);
router5.post('/deleteDesktopChats',userAuth, deleteDesktopChats);

module.exports = router5;