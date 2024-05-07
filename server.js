const express = require('express');
const app = express();
app.use(express.json());
app.use("/", express.static("./website"));
const path = require('path');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
require('dotenv').config();

// Middleware
app.use(bodyParser.json());

// Database connection
const db = mysql.createConnection({
    host: process.env.host,
    user: process.env.user,
    password: process.env.password,
    port: process.env.port,
    database: process.env.database
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        return;
    }
    console.log('Connected to database');
});

// User registration endpoint
app.post('/register', (req, res) => {
    const { username, firstName, lastName, email, password, bio } = req.body;

    // Validate username
    const usernameRegex = /^[a-zA-Z0-9]+$/;
    if (!username || !usernameRegex.test(username)) {
        return res.status(400).json({ message: 'Username is required and can only contain letters and numbers.' });
    }

    // Validate first name
    const firstNameRegex = /^[a-zA-Z]+$/;
    if (!firstName || !firstNameRegex.test(firstName)) {
        return res.status(400).json({ message: 'First name is required and can only contain letters.' });
    }

    // Validate last name
    const lastNameRegex = /^[a-zA-Z]+$/;
    if (!lastName || !lastNameRegex.test(lastName)) {
        return res.status(400).json({ message: 'Last name is required and can only contain letters.' });
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        return res.status(400).json({ message: 'Please enter a valid email address.' });
    }

    // Validate password
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!password || !passwordRegex.test(password)) {
        return res.status(400).json({ message: 'Password is required and must contain at least one letter and one number, and at least 8 or more characters.' });
    }

    // Validate bio
    if (!bio || bio.length > 200) {
        return res.status(400).json({ message: 'Bio is required and cannot exceed 200 characters.' });
    }

    // If all validation passes, proceed with user registration logic
    // Generate salt and hash the password
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            return res.status(500).json({ message: 'Error hashing password' });
        }

        // Store the user in the database with hashed password
        db.query('INSERT INTO users (username, password_hash, first_name, last_name, email, bio)' +
            'VALUES (?, ?, ?, ?, ?, ?)', [username, hashedPassword, firstName, lastName, email, bio], (err, results) => {
                if (err) {
                    return res.status(500).json({ message: 'Database error' });
                }

                res.status(201).json({ message: 'User registered successfully' });
            });
    });
});

// User sign-in endpoint
app.post('/signin', (req, res) => {
    const { username, password } = req.body;

    // Validate username and password 
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    // Fetch user from database
    db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: 'User not found' });
        }

        const user = results[0];

        // Compare passwords
        bcrypt.compare(password, user.password_hash, (err, isMatch) => {
            if (err) {
                return res.status(500).json({ message: 'Authentication error' });
            }

            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid password' });
            }

            // Authentication successful
            res.status(200).json({ message: 'Login successful' });
        });
    });
});

// Start the server
const PORT = process.env.PORT || 2500;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
