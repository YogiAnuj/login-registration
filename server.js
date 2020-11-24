const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const connectDB = require('./config/db');


const app = express();
app.use(bodyParser.json());

// configuring dotenv
require('dotenv').config({
    path: './config/config.env'
})

// connect to the database
connectDB();


// config only for development
if (process.env.NODE_ENV === 'development') {
    app.use(cors({
        origin: process.env.CLIENT_URL
    }));

    // morgan give the information about each request
    app.use(morgan('dev'));
}

const PORT = process.env.PORT;

// Load all routes
const authRouter = require('./routes/auth.route');
// use this route
app.use('/api/', authRouter)

app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: 'Page not found'
    })
})

app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
})