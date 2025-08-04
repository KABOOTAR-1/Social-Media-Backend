const jwt = require('jsonwebtoken');
const Auth = require('../models/auth');

const login = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).send('Username and password are required');
    }
    const auth = Auth.findOne({ username });
    if (!user) {
        return res.status(404).send('User not found');
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
        return res.status(401).send('Invalid password');
    }

    const currentUser = await User.findOne({ userInfo: user._id }).populate('userInfo');

    const token = jwt.sign({ username }, 'secretKey', { expiresIn: '1h' });
    res.status(200).json({ status: "Success", token: token, user: currentUser });
}

const register = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        throw new Error('Username and password are required');
    }

    const existingUser = await Auth.findOne({ username });
    if (existingUser) {
       throw new Error('User already exists');
    }

    const newUser = new User({ username, password });
    await newUser.save();

    res.status(201).send('User registered successfully');
}