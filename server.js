const express = require("express")
const app = express();
const db = require('./db');
require('dotenv').config();


// const bodyParser = require("body-parser")
// app.use(bodyParser.json()); //req.body
app.use(express.json());
const PORT = process.env.PORT || 8000;

//import the router files
const userRoutes  = require('./Routes/userRoutes')
const candidateRoutes = require('./Routes/candidateRoutes');

//Use the routes
app.use('/user',userRoutes);
app.use('/candidate', candidateRoutes);


app.listen(PORT, ()=>{
    console.log("app started on port 8000")
})