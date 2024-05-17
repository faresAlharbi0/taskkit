const express = require('express');
const app = express();
app.use(express.json());
app.use("/",express.static("./website"));
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

app.get("/:username/workspaces/:workspace",(req,res) => {
    res.sendFile(path.join(__dirname, 'app', 'workspace.html'));
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
// getting workspace info
app.get("/getmywsInfo/:workspace",(req,res)=>{
    const uuid = req.params.workspace;
    db.query('SELECT username, wsname, wsdescription FROM workspaces WHERE uuid = BINARY ?', [uuid], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: 'workspace not found' });
        }

        let userdata = results[0];
        return res.status(200).send(JSON.stringify(userdata))
    })
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

// getting group members info
// getting workspace info
app.get("/getmywsmembers/:workspace",(req,res)=>{
    const uuid = req.params.workspace;
    db.query('SELECT username, userStatus FROM groupmembers WHERE listid IN (SELECT id FROM  '
    +'grouplist WHERE uuid = BINARY ?)', [uuid], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: 'workspace not found' });
        }

        let userdata = results;
        return res.status(200).send(JSON.stringify(userdata))
    })
});
    
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
                    db.query("INSERT INTO articleLists (uuid) VALUES (?)",[uuidString], (err,results)=>{
                        if (err) {
                            return res.status(500).json({ message: 'Database error: ' + err });
                        }
                        db.query("INSERT INTO groupChat (uuid) VALUES (?)",[uuidString], (err,results)=>{
                            if (err) {
                                return res.status(500).json({ message: 'Database error: ' + err });
                            }
                            db.query("INSERT INTO taskListsBoxes (uuid) VALUES (?)",[uuidString], (err,results)=>{
                                if (err) {
                                    return res.status(500).json({ message: 'Database error: ' + err });
                                }
                                res.status(201).json({ message: 'workspace created successfully' });
                            })
                        })
                    })
                });
            })
    });
    
})
// retrive worspaces that the user are invited to
app.get("/myInvitews/:user", (req,res)=>{
    const username = req.params.user;

    db.query('SELECT w.uuid, w.username, w.wsname, w.wsdescription, w.created_at '+
    'FROM workspaces w '+
    'JOIN inviteWorkspaces i ON w.uuid = i.uuid '+
    'WHERE i.username = BINARY ? '+
    'GROUP BY w.uuid, w.username, w.wsname, w.wsdescription, w.created_at '+
    'ORDER BY w.created_at DESC; '
    , [username], (err, results) => {
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
    db.query('SELECT username FROM users WHERE username = BINARY ?',[username],(err,results)=>{
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: 'User not found' });
        }

        db.query('SELECT (SELECT COUNT(readStatus) FROM notificationMessages ' +
        'WHERE readStatus = 0 AND boxID = ALL (SELECT id FROM notificationBoxes WHERE username = BINARY ?)) AS notifs'+
        ' , isDialouge, actionTarget,_message FROM notificationMessages '+
         'WHERE boxID = ALL (SELECT id FROM notificationBoxes WHERE username = BINARY ?) '+
          'GROUP BY id, isDialouge, actionTarget, _message ORDER BY id DESC', [username, username], (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'Database error :' + err });
            }
    
            if (results.length === 0) {
                return res.status(401).json({ message: 'no notification mesagges found' });
            }
    
            let userdata = results;
            return res.status(200).send(JSON.stringify(userdata))
        })
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
// responding to an invite
app.post("/inviteResponse", (req,res)=>{
    const {username, uuid, response} = req.body;
    if(response === 1){
        db.query('UPDATE notificationMessages SET isDialouge = 0, _message = CONCAT("you accepted the invitation from: ", '+ 
        '(SELECT username FROM workspaces where uuid = BINARY ?), ", to join: ", (SELECT wsname FROM workspaces where uuid = BINARY ?))'+
        ' WHERE actionTarget = BINARY ? AND boxID = (SELECT id from notificationBoxes WHERE username = BINARY ?)', [uuid,uuid,uuid,username],
        (err,results) =>{
            if (err) {
                return res.status(500).json({ message: 'Database error '+err });
            }
        db.query('UPDATE groupmembers SET userStatus = ? WHERE username = ? AND listid = ( '+
            'SELECT id FROM  grouplist WHERE uuid = ?)',[response,username,uuid],(err,results)=>{
                if (err) {
                    return res.status(500).json({ message: 'Database error '+err });
                }
                db.query('INSERT INTO inviteWorkspaces (username,uuid) VALUES (?, ?)' ,[username,uuid],(err,results)=>{
                    if (err) {
                        return res.status(500).json({ message: 'Database error '+err });
                    }
                    res.status(201).json({ message: 'User entered successfully' });
                })
            })
        })   
    }
    else if(response === 0){
        db.query('UPDATE notificationMessages SET isDialouge = 0, _message = CONCAT("you declined the invitation from: ", '+ 
        '(SELECT username FROM workspaces where uuid = BINARY ?), ", to join: ", (SELECT wsname FROM workspaces where uuid = BINARY ?))'+
        ' WHERE actionTarget = BINARY ? AND boxID = (SELECT id from notificationBoxes WHERE username = BINARY ?)', [uuid,uuid,uuid,username],
        (err,results) =>{
            if (err) {
                return res.status(500).json({ message: 'Database error '+err });
            }
            db.query('UPDATE groupmembers SET userStatus = ? WHERE username = ? AND listid = ( '+
            'SELECT id FROM  grouplist WHERE uuid = ?)',[response,username,uuid],(err,results)=>{
                if (err) {
                    return res.status(500).json({ message: 'Database error '+err });
                }
                res.status(201).json({ message: 'User entered successfully' });
            })
        
        })   
    }
    else{
        return res.status(401).json({ message: 'the request is invalid' });
    }
})
//inviting a user to a workspace
app.post("/inviteuser/:user", (req,res)=>{
    const sender = req.params.user;
    const { username, uuid, wsname} = req.body
    const message = sender +" invited you to: " + wsname;
    if(sender === username){
        return res.status(400).json({ message: 'invalid request' });
    }
    else{
        db.query('SELECT id FROM notificationBoxes WHERE username = BINARY ?', [username], (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'Database error: ' + err });
            }
            if (results[0]){
                db.query("INSERT INTO notificationMessages (boxID, actionTarget,isDialouge, _message) VALUES (?, ?, ?, ?)" 
                ,[results[0].id,uuid,1,message], (err,results) =>{
                if(err){
                    return res.status(500).json({ message: 'Database error: '+err});
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

    }
    eventEmitter.emit("/notifications/"+username,  {username: username, uuid:uuid, wsname:wsname, isDialouge: 1});
})

//adding a new tasklist endpoint
app.post("/addTaskList",(req,res)=>{
    const {username,uuid,title} = req.body;
    db.query("SELECT id FROM taskListsBoxes WHERE uuid = BINARY ?",[uuid],(err,results)=>{
        if(err){
            return res.status(500).json({ message: 'Database error: '+err});
        }
        let uuidString = uuidv4();
        db.query("INSERT INTO taskLists (taskListuuid,title,boxID) VALUES (?,?,?)",[uuidString,title,results[0].id],(err,results)=>{
            if(err){
                return res.status(500).json({ message: 'Database error: '+err});
            }
            res.status(201).json({ message: 'task list entered successfully' });
        })
    })
})
//getting tasks list endpoint
app.get("/getMyTaskLists/:workspace",(req,res)=>{
    const uuid = req.params.workspace;
    db.query("SELECT uuid FROM workspaces WHERE uuid = ?",[uuid],(err,results)=>{
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: 'workspace not found' });
        }
        db.query("SELECT title,taskListuuid FROM taskLists WHERE boxID IN (select id "
        +"FROM taskListsBoxes WHERE uuid = BINARY ?)",[uuid],(err,results)=>{
            if (err) {
                return res.status(500).json({ message: 'Database error: ' + err });
            }
            if (results.length === 0) {
                return res.status(401).json({ message: 'tasklists not found' });
            }
            let userdata = results;
            return res.status(200).send(JSON.stringify(userdata))
        })

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