const express = require('express');
const addFeedback = require('../Controllers/ContactController');

const Router7 = express.Router();

Router7.post("/addFeedback",addFeedback);

module.exports = Router7;