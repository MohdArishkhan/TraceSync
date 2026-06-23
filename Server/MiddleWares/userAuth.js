const jwt = require("jsonwebtoken");

require("dotenv").config();

const cookieParser = require("cookie-parser");

const userAuth = async (req, res, next) => {
    // console.log(req);
    const { token } = req.cookies;
    // console.log("Token received:", token);

    if (!token) {
        return res.status(401).send({
            status: 0,
            message: "Unauthorized access: No token provided"
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!req.body) req.body = {};
        req.body.userId = decoded.id;
        // console.log("Decoded userId:", req.body.userId);
    } catch (e) {
        // console.error("Error verifying token:", e.message);  // Log the error message to debug
        return res.status(401).send({
            status: 0,
            message: "Unauthorized access - Token is invalid or expired"
        });
    }

    next();
};

module.exports = userAuth;