const express = require('express');
const { createRoomDocument } = require('../Controllers/roomController');

const router = express.Router();

router.post('/', createRoomDocument);

module.exports = router;
