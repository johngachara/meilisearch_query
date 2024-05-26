const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const express = require("express");
dotenv.config();
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require("../models/User");

// Register new user
router.post('/',
    [
        body('username').notEmpty().withMessage('Username is required').isString().withMessage('Username must be of type String'),
        body('password').notEmpty().withMessage('Password is required'),
        body('email').notEmpty().withMessage('Email is required').isEmail().withMessage('Please enter valid email address'),
    ],
    async function(req, res) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { username, email, password } = req.body;

    try {
        let user = await User.findOne({ username  });
        let user_email = await User.findOne({email})
        if (user_email) {
            return res.status(400).json({ msg: 'User already exists' });
        }
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }
        if(!email.endsWith("@gmail.com")) {
            return res.status(400).json({ msg: 'Please enter a valid email address' });
        }
        user = new User({
            username,
            email,
            password,
        });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        const payload = {
            user: {
                id: user.id,
            },
        };

        jwt.sign(
            payload,
            process.env.TOKEN,
            { expiresIn: '1h' },
            (err, token) => {
                if (err){
                  return res.status(401).send(err)
                }
                res.json({ token });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send({error: err.message});
    }
});
module.exports = router