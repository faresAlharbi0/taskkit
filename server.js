const express = require('express');
const app = express();
app.use(express.json());
app.use("/",express.static("./website"));
const path = require('path');
const { EventEmitter } = require('events');
const eventEmitter = new EventEmitter();
app.listen(2500,(req,res)=>{
    // type "npm run dev" on the terminal for the server to run with hot reloading
    console.log("server started at 2500")
});

app.get("/",(req,res) => {
    res.sendFile(path.join(__dirname, 'app', 'welcome.html'));
})

app.get('/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    eventEmitter.on("secretMessgae", (message) =>{
        res.write(`data: hi ${message}\n\n`);
    });
})
app.get('/events/:sayhi', (req,res) =>{
    const user = req.params.sayhi;
    eventEmitter.emit("secretMessgae", "user: "+ user);
    res.end();
})