const Auth = require("../models/auth");
const User = require("../models/users");
const jwt = require("jsonwebtoken");

const verifyToken = async (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ status: false, message: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'secretKey', async (err, decoded) => {
        if (err) {
            return res.status(403).json({ status: false, message: 'Invalid token' });
        }
        const auth= await Auth.findById(decoded.id);
        if (!auth) {
            return res.status(404).json({ status: false, message: 'User not found' });
        }
        req.auth =auth;
        const user= await User.findOne({ userInfo: auth._id });
        if (!user) {
            return res.status(404).json({ status: false, message: 'User not found' });
        }
        req.user = user;
        next();
    });
}

module.exports = verifyToken;