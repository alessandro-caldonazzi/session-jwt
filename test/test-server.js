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
    session.newSession({ "user": "ale" }, (JWT, refresh) => {
        res.cookie('refresh', refresh, { maxAge: 90000000, httpOnly: false, secure: false });
        res.send({ "jwt": JWT });
    });

});

app.get("/refresh", async(req, res) => {
    let jwt = await session.refresh(req);
    if (jwt) {
        res.send({ "jwt": jwt });
    } else {
        res.redirect(301, '/login');
        res.end();
    }
});

module.exports = app;