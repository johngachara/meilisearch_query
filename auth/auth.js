const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

module.exports = async function (req, res, next) {
    // Get the Authorization header
    const authHeader = req.header('Authorization');

    // Check if the Authorization header exists and starts with 'Bearer '
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // Extract the token from the Authorization header
    const token = authHeader.split(' ')[1];

    try {
        const response = await fetch(process.env.BACKEND_URL, {
            method: 'GET', // Specify the HTTP method
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            return res.status(403).json({ error: "Unauthorized" });
        }

        const data = await response.json();
        console.log('Successfully logged in:', data);
        // If the user is authenticated, proceed to the next middleware
        next();

    } catch (err) {
        console.error('Fetch error:', err.message);
        return res.status(401).json({ msg: 'Token is not valid' });
    }
};
