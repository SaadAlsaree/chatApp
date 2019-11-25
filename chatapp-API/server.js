const express = require("express");
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
// const logger = require('morgan');


const app = express();

const dbconfig = require('./config/secret');

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));
app.use(cookieParser());
// app.use(logger('dev'));

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  
    next();
  });
  
mongoose.Promise = global.Promise;
mongoose.connect(dbconfig.url, { useNewUrlParser: true, useUnifiedTopology: true });


const auth = require('./routes/authRoytes');
const posts = require('./routes/postRoutes');
 
app.use('/api/chatapp', auth);
app.use('/api/chatapp', posts);

app.listen(3000,() => {
    console.log('Running on port 3000');
});
