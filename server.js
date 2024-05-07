const express = require('express');
const app = express();
app.use(express.json());
app.use("/", express.static("./website"));
const path = require('path');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
require('dotenv').config()
const { v4: uuidv4 } = require('uuid');
const { EventEmitter } = require('events');
const eventEmitter = new EventEmitter();
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
// getting user info
app.get('/userinfo/:user',(req,res) => {
    const username = req.params.user;

    db.query('SELECT username, first_name, last_name, email, bio, created_at FROM users WHERE username = BINARY ?', [username], (err, results) => {
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
app.post("/addws",(req,res)=>{
    const { username, workspaceName, workspaceDescription} = req.body;
    uuidString = uuidv4();
    if (!username || !workspaceName || !workspaceDescription) {
        return res.status(400).json({ message: 'Username, workspaceName, workspaceDescription is required' });
    }
    db.query('INSERT INTO workspaces (uuid, username, wsname, wsdescription)' +
        'VALUES (?, ?, ?, ?)', [uuidString, username,workspaceName, workspaceDescription], (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'Database error' });
            }
            db.query("INSERT INTO grouplist (uuid) VALUES (?)",[uuidString], (err,results)=>{
                if (err) {
                    return res.status(500).json({ message: 'Database error' });
                }
                db.query("INSERT INTO groupmembers (listid, username, userStatus) SELECT id AS listid, ? AS username, 1 AS userStatus FROM grouplist WHERE uuid"
                + "= BINARY ?", [username, uuidString], (err, results) => {
                    if (err) {
                        return res.status(500).json({ message: 'Database error: ' + err });
                    }
                    res.status(201).json({ message: 'workspace created successfully' });
                });
            })
    });
    
})
// retrive workspaces with for a given username creator
app.get("/myws/:user", (req,res)=>{
    const username = req.params.user;

    db.query('SELECT uuid,username, wsname, wsdescription, created_at FROM workspaces WHERE username = BINARY ? ORDER BY created_at DESC', [username], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: 'workspaces not found' });
        }

        let userdata = results;
        return res.status(200).send(JSON.stringify(userdata))
    })
})
// update notificattion read status
app.get('/updatemyNotifMessages/:user', (req,res) =>{
    const username = req.params.user;
    db.query('UPDATE notificationMessages SET readStatus = 1 WHERE boxID IN (SELECT id FROM notificationBoxes '+
    'WHERE username = BINARY ?)',[username], (err,results)=>{
        if(err){
            return res.status(500).json({ message: 'Database error :' + err });
        }
        res.status(201).json({ message: 'data updated successfully' });
    })
})
// retrive notification messages 
app.get("/myNotifMessages/:user", (req,res)=>{
    const username = req.params.user;

    db.query('SELECT (SELECT COUNT(readStatus) FROM notificationMessages WHERE readStatus = 0 AND boxID = ALL (SELECT id FROM notificationBoxes WHERE username = BINARY ?)) AS notifs'+
    ' , isDialouge, actionTarget,_message FROM notificationMessages '+
     'WHERE boxID = ALL (SELECT id FROM notificationBoxes WHERE username = BINARY ?) GROUP BY id, isDialouge, actionTarget, _message ORDER BY id DESC', [username, username], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error :' + err });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: 'workspaces not found' });
        }

        let userdata = results;
        return res.status(200).send(JSON.stringify(userdata))
    })
})
// notifications SEE endpoint
app.get('/notifications/:user', (req, res) => {
    const username = req.params.user;
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    eventEmitter.on("/notifications/"+ username, (obj) =>{
        res.write(`data:${JSON.stringify({obj})}\n\n`);
    });
})
//inviting a user to a workspace
app.post("/inviteuser/:username", (req,res)=>{
    const sender = req.params.user;
    const { username, uuid, wsname} = req.body
    const message = "you got invited to: " + wsname;
    db.query('SELECT id FROM notificationBoxes WHERE username = BINARY ?', [username], (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'Database error' });
            }
            if (results[0]){
                db.query("INSERT INTO notificationMessages (boxID, actionTarget,isDialouge, _message) VALUES (?, ?, ?, ?)" 
                ,[results[0].id,uuid,1,message], (err,results) =>{
                if(err){
                    return res.status(500).json({ message: 'Database error'});
                }
                db.query("INSERT INTO groupmembers (listid, username) SELECT id AS listid, ? AS username FROM grouplist WHERE uuid = BINARY ?", [username, uuid], (err, results) => {
                    if (err) {
                        return res.status(500).json({ message: 'Database error: ' + err });
                    }
                    res.status(201).json({ message: 'User entered successfully' });
                });
                })
            }
    });
    eventEmitter.emit("/notifications/"+username,  {username: username, uuid:uuid, wsname:wsname, isDialouge: 1});
})

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
            db.query('INSERT INTO notificationBoxes (username) VALUES (?)', [username], (err, results) => {
                if (err) {
                    return res.status(500).json({ message: 'Database error' });
                }
                    res.status(201).json({ message: 'User registered successfully' });
            })

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
