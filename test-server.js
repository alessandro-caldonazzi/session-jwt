const express = require("express");
const session = require("./index.js");
const jwt = require("jsonwebtoken");
const app = express();

app.use(session.middleware);

console.log(Array.isArray(["a"]));

session.settings("segreto", ["/"], "/login");

app.get("/", (req, res) => {
    res.send("kk");
});

app.listen(3000, function() {
    console.log("server on");
});

app.get("/login", (req, res) => {
    res.send({
        "jwt": jwt.sign({ user: "ale" }, session.config.secret)
    });
});

module.exports = app;