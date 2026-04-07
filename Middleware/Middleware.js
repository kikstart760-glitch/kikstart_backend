const jwt = require('jsonwebtoken');

const middleware = (req, res, next) => {
    const authentication = req.headers.authorization;

    if (!authentication || !authentication.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const token = authentication.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Token not found' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.jwtpayload = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
    }

}

const accessToken = (userdata) => {
    return jwt.sign(userdata, process.env.JWT_ACCESS_SECRET, { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' });
}

const refreshToken = (userdata) => {
    return jwt.sign(userdata, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' });
}

module.exports = { middleware, accessToken, refreshToken };