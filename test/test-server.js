//this file represent an express server needed to execute test

//ATTENTION: take inspiration only regarding the methods of the npm module, the rest is not ready to go into production

const express = require("express");
const session = require("../index.js");
const jwt = require("jsonwebtoken");
var cookieParser = require("cookie-parser");
const app = express();

//session.importConfig(require("./config.json"));
session.settings("segreto");

app.use(cookieParser());
//app.use(session.middleware);
app.use(express.urlencoded({ extended: true }));

app.use(express.static(__dirname + "/client"));

app.get("/user", session.ensureAuth, (req, res) => {
    res.send("kk");
});

app.listen(3000, function() {
    console.log("server on");
});

app.get("/login", async(req, res) => {
    let { jwt, refreshToken } = await session.newSessionInCookies({ "user": "ale" }, res, "user");

    res.send({ "jwt": jwt });
});

app.get("/refresh", async(req, res) => {
    try {
        const jwt = await session.refreshFromCookie(req);
        res.status(200).json({ jwt });
    } catch (err) {
        //if refreshToken is invalid, the user must log in
        res.redirect(301, "/login");
        res.end();
    }
});

app.get("/blacklist", async(req, res) => {
    let blacklist = await session.blacklist(req.headers.jwt).catch();
    session.deleteRefresh(res);
    res.send({ blacklist });
});

module.exports = app;