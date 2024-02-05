const express = require('express');
const app = express();
app.use(express.json());
app.use("/",express.static("./website"));
app.listen(2500,(req,res)=>{
    // type "npm run dev" on the terminal for the server to run with hot reloading
    console.log("server started at 2500")
});