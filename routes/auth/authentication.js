const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();
require('dotenv').config();

router.use(express.json());

//create new user
router.post('/user', async (req, res) => {
    try {
        const { name, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        if(req.body.email) {
            const { email } = req.body;

            await req.db.query(
                `INSERT INTO users (name, email, hashed_password)
                    VALUES (:name, :email, :hashedPassword);`,
                {
                    name,
                    email,
                    hashedPassword
                }
            );
        } else {
            await req.db.query(
                `INSERT INTO users (name, hashed_password)
                    VALUES (:name, :hashedPassword)`,
                {
                    name,
                    hashedPassword
                }
            );
        }

        res.status(200).send({success: true, message: 'User added!', data: null});
    } catch (err) {
        res.status(200).send({success: false, message: err, data: null});
    }
});

//logging in
router.post('/login', async (req, res) => {
    try {
        const { name, password: sentPassword } = req.body;
        
        const result = await req.db.query(
            `SELECT hashed_password 
                FROM users
                WHERE name = :name`,
            {
                name
            }
        );

        if(result[0].length === 0) {
            throw new Error('User is not found!');
        }

        const { hashed_password } = result[0][0];

        if(await bcrypt.compare(sentPassword, hashed_password)) {
            const accessToken = jwt.sign(name, process.env.ACCESS_TOKEN_SECRET);

            res.status(200).send({success: true, message: `Logged In!`, accessToken, data: null});
        } else {
            throw new Error(`Incorrect password!`);
        }
    } catch (err) {
        res.status(401).send({success: false, message: err, data: null});
    }
});

module.exports = router;