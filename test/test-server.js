//this file represent an express server needed to execute test

//ATTENTION: take inspiration only regarding the methods of the npm module, the rest is not ready to go into production

const express = require("express");
const session = require("../index.js");
var cookieParser = require("cookie-parser");
const app = express();

session.settings("segreto");

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(__dirname + "/client"));

app.get("/user", session.ensureAuth, (req, res) => {
    res.send("kk");
});

app.listen(3000, function () {
    console.log("server on");
});

app.get("/login", async (req, res) => {
    let { jwt } = await session.newSessionInCookies({ user: "user" }, res, "user");

    res.send({ jwt });
});

app.get("/refresh", async (req, res) => {
    try {
        const jwt = await session.refreshFromCookie(req);
        res.status(200).json({ jwt });
    } catch (err) {
        //if refreshToken is invalid, the user must log in
        res.redirect(301, "/login");
        res.end();
    }
});

app.get("/blacklist", async (req, res) => {
    session.blacklist(req.headers.jwt);
    session.deleteRefresh(res);
    res.send();
});

app.get("/admin", session.ensureAuth, session.hasRole("admin"), async (req, res) => {
    res.send({ message: "you are an admin" });
});

app.get("/adminLogin", async (req, res) => {
    let { jwt } = await session.newSessionInCookies({ user: "user" }, res, "admin");

    res.send({ jwt });
});

module.exports = app;
