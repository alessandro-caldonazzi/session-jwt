//this file represent an express server needed to execute test

//ATTENTION: take inspiration only regarding the methods of the npm module, the rest is not ready to go into production

const express = require("express");
const session = require("../index.js");
const jwt = require("jsonwebtoken");
var cookieParser = require("cookie-parser");
const app = express();

session.importConfig(require("./config.json"));
session.settings("segreto");

app.use(cookieParser());
app.use(session.middleware);
app.use(express.urlencoded({ extended: true }));

app.use(express.static(__dirname + "/client"));

app.get("/user", (req, res) => {
    res.send("kk");
});

app.listen(3000, function() {
    console.log("server on");
});

app.get("/login", async(req, res) => {
    let { jwtToken, refreshToken } = await session.newSession({ "user": "ale" }, res, "user");

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
    session.deleteRefresh(res);
    res.send({ blacklist });
});

module.exports = app;