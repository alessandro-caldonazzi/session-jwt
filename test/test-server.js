const express = require("express");
const session = require("../index.js");
const jwt = require("jsonwebtoken");
var cookieParser = require('cookie-parser')
const app = express();

app.use(cookieParser())
app.use(session.middleware);


session.settings("segreto", ["/"], "/login");

app.get("/", (req, res) => {
    res.send("kk");
});

app.listen(3000, function() {
    console.log("server on");
});

app.get("/login", (req, res) => {
    let [JWT, refresh] = session.newSession({ "user": "ale" });
    res.cookie('refresh', refresh, { maxAge: 900000, httpOnly: true, secure: true });
    res.send({ "jwt": JWT });
});

app.get("/refresh", (req, res) => {
    res.send("JWT");
});

module.exports = app;