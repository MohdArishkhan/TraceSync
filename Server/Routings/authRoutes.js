const express = require('express');
const { login, register, logout, sendVerifyOTP, verifyEmail, verifyOTPforPasswordReset, CheckverifyOTPforPasswordReset, resetPassword, isAuthenticated } = require('../Controllers/myControllers');
const userAuth = require('../MiddleWares/userAuth');
const myRouter = express.Router();

myRouter.post("/login",login);
myRouter.post("/register",register);
myRouter.post("/logout",logout);
myRouter.post("/sendVerifyOTP",userAuth,sendVerifyOTP);
myRouter.post("/verifyEmail",userAuth,verifyEmail);
myRouter.get("/isAuthenticated",userAuth,isAuthenticated);
myRouter.post("/verifyOTPforPasswordReset",verifyOTPforPasswordReset);
myRouter.post("/CheckverifyOTPforPasswordReset",CheckverifyOTPforPasswordReset);
myRouter.put("/resetPassword",resetPassword);

module.exports = myRouter;