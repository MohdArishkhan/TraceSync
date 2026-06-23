const express = require('express');
const userAuth = require('../MiddleWares/userAuth');
const changeTheme = require('../Controllers/ThemeController');
const router6 = express.Router();


router6.post("/changeTheme",userAuth,changeTheme);


module.exports = router6;