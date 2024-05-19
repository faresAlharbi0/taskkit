const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');

const app = express();
const port = 3306;

// Middleware
app.use(bodyParser.json());

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'myapp'
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
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    // Generate salt and hash the password
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            return res.status(500).json({ message: 'Error hashing password' });
        }

        // Store the user in the database with hashed password
        db.query('INSERT INTO users (username, password_hash) VALUES (?, ?)', [username, hashedPassword], (err, results) => {
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

            res.status(200).json({ message: 'Login successful' });
        });
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
