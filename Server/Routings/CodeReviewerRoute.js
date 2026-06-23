const express = require('express');
const { getResponse } = require('../Controllers/CodeReviewerController');
const myRouter2 = express.Router();

myRouter2.post("/get-response",getResponse);

module.exports = myRouter2;