const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const express = require("express");
dotenv.config();
const router = express.Router();
const User = require("../models/User");
const { body, validationResult } = require('express-validator');
router.post('/',[
    body('username').notEmpty().withMessage('Username is required').isString().withMessage('Username must be of type String'),
    body('password').notEmpty().withMessage('Password is required')

],
    async function(req, res) {
    const { username, password } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {


    const user = await User.findOne({username})
    if (!user) {
        return res.status(400).json({ msg: 'User does not exist' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ msg: 'invalid password' });
    }
    const payload = {
        user : {
            id : user.id
        }
    }
    await jwt.sign(payload,process.env.TOKEN, {expiresIn: '1h'},(err, token) => {
        if(err){
            return res.status(401).send(err)
        }
        return res.json({ token });
    });
    }
    catch(err){
        console.error(err.message);
        return res.status(500).send({error: err.message});
    }
})
module.exports = router