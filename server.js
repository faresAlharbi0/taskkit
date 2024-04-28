const express = require('express');
const app = express();
app.use(express.json());
app.use("/",express.static("./website"));
const path = require('path');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
require('dotenv').config()
app.listen(2500,(req,res)=>{
    // type "npm run dev" on the terminal for the server to run with hot reloading
    console.log("server started at 2500")
});

app.get("/:username",(req,res) => {
    res.sendFile(path.join(__dirname, 'app', 'welcome.html'));
})
// test

// Middleware
app.use(bodyParser.json());

// Database connection
const db = mysql.createConnection({
    host:process.env.host,
    user:process.env.user,
    password:process.env.password,
    port:process.env.port,
    database:process.env.database
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        return;
    }
    console.log('Connected to database');
});
// getting user info
app.get('/userinfo/:user',(req,res) => {
    const username = req.params.user;

    db.query('SELECT username, first_name, last_name, email, bio, created_at FROM users WHERE username = ?', [username], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: 'User not found' });
        }

        let userdata = results[0];
        return res.status(200).send(JSON.stringify(userdata))
    })
})
// User registration endpoint
app.post('/register', (req, res) => {
    const { username, firstName, lastName, email, password, bio } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    // Generate salt and hash the password
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            return res.status(500).json({ message: 'Error hashing password' });
        }

        // Store the user in the database with hashed password
        db.query('INSERT INTO users (username, password_hash, first_name, last_name, email, bio)' +
        'VALUES (?, ?, ?, ?, ?, ?)', [username, hashedPassword,firstName, lastName, email, bio], (err, results) => {
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