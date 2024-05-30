const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const express = require("express");
dotenv.config();
const router = express.Router();
const User = require("../models/User");
const { body, validationResult } = require('express-validator');

router.post('/', [
    body('username').notEmpty().withMessage('Username is required').isString().withMessage('Username must be of type String'),
    body('password').notEmpty().withMessage('Password is required')
], async function (req, res) {
    const { username, password } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const response = await fetch(process.env.AUTH_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            const errorData = await response.json();
            return res.status(400).json({ error: errorData });
        }

        const data = await response.json();
        return res.status(200).send({ access: data.access });

    } catch (err) {
        console.error(err.message);
        return res.status(500).json({ error: err.message });
    }
});

module.exports = router;
