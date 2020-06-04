const express = require('express');
const session = require("./index.js");
const jwt = require('jsonwebtoken');
const app = express();

app.use(session.middleware);

session.config.secret="segreto";
session.config.loginUrl="/login";
session.config.restrictedArea=['/'];

app.get('/', (req, res) => {
    res.send("kk");
});

app.listen(3000, function () {
    console.log('server on');
});

app.get('/login', (req, res)=>{
    res.send(jwt.sign({user:'ale'}, session.config.secret));
});