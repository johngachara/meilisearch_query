const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

module.exports = function (req, res, next) {
    // Get the Authorization header
    const authHeader = req.header('Authorization');

    // Check if the Authorization header exists and starts with 'Bearer '
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // Extract the token from the Authorization header
    const token = authHeader.split(' ')[1];
    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.TOKEN);

        // Attach the decoded user to the request object
        req.user = decoded.user;
    } catch (err) {
        // If token is not valid, send an error response
        res.status(401).json({ msg : err.message });
    }
    next()
};
