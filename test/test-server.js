//this file represent an express server needed to execute test

//ATTENTION: take inspiration only regarding the methods of the npm module, the rest is not ready to go into production

const express = require("express");
const session = require("../index.js");
const jwt = require("jsonwebtoken");
var cookieParser = require("cookie-parser");
const app = express();

app.use(cookieParser());
app.use(session.middleware);
app.use(express.urlencoded({ extended: true }));

session.settings("segreto", ["/"], "/login");

//ATTENTION THIS IS NOT PRODUCTION READY | DO NOT USE THIS IN PRODUCTION
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(express.static(__dirname + "/client"));

app.get("/", (req, res) => {
    res.send("kk");
});

app.listen(3000, function() {
    console.log("server on");
});

app.get("/login", async(req, res) => {
    let { jwtToken, refreshToken } = await session.newSession({ "user": "ale" });

    res.cookie("refresh", refreshToken, { maxAge: 90000000, httpOnly: false, secure: false });
    res.send({ "jwt": jwtToken });
});

app.get("/refresh", async(req, res) => {
    let jwt = await session.refresh(req);
    if (jwt) {
        res.setHeader("Content-Type", "application/json");
        res.send({ jwt });
    } else {
        res.redirect(301, "/login");
        res.end();
    }
});

app.get("/blacklist", async(req, res) => {
    let blacklist = await session.blacklist(req.headers.jwt).catch();
    res.send({ blacklist });
});





module.exports = app;