require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const { yta, ytv } = require('./ytDownloader');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY || 'secretkey123';

app.use(cors());
app.use(bodyParser.json());

// Middleware untuk verifikasi JWT
function verifyToken(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).send({ message: 'No token provided' });
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(500).send({ message: 'Failed to authenticate token' });
        req.userId = decoded.id;
        next();
    });
}

// API Login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    // Dummy user
    if (username === 'admin' && password === 'password') {
        const token = jwt.sign({ id: username }, SECRET_KEY, { expiresIn: '30d' });
        return res.json({ token });
    }
    res.status(401).send({ message: 'Invalid credentials' });
});

// API Unduh Audio
app.post('/api/yta', verifyToken, async (req, res) => {
    const { url, server } = req.body;
    try {
        const result = await yta(url, server || 'en68');
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// API Unduh Video
app.post('/api/ytv', verifyToken, async (req, res) => {
    const { url, server } = req.body;
    try {
        const result = await ytv(url, server || 'en68');
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
