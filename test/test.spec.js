const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("./test-server");

chai.use(chaiHttp);
chai.should();

describe("Unauthorized user", () => {
    it("Cannot access protected area", (done) => {
        chai.request(server)
            .get("/user")
            .end((err, res) => {
                res.should.have.status(401);
                done();
            });
    });

    it("Cannot access role based area", (done) => {
        chai.request(server)
            .get("/admin")
            .end((err, res) => {
                res.should.have.status(401);
                done();
            });
    });
});

describe("Authorized user - role=user", () => {
    let jwt, cookie;
    step("Obtain jwt", (done) => {
        chai.request(server)
            .get("/login")
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a("object");
                jwt = res.body.jwt;
                res.body.should.have.property("jwt");
                res.header["set-cookie"].should.have.length(1);
                cookie = res.header["set-cookie"];
                done();
            });
    });

    step("Access restrict area  with jwt", (done) => {
        chai.request(server)
            .get("/user")
            .set("jwt", jwt)
            .end((err, res) => {
                res.should.have.status(200);
                res.text.should.equal("kk");
                done();
            });
    });

    step("Refresh token", (done) => {
        chai.request(server)
            .get("/refresh")
            .set("Cookie", cookie[0])
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a("object");
                res.body.should.have.property("jwt");
                done();
            });
    });

    step("Cannot access admin page", (done) => {
        chai.request(server)
            .get("/admin")
            .end((err, res) => {
                res.should.have.status(401);
                done();
            });
    });

    step("Blacklist this jwt", (done) => {
        chai.request(server)
            .get("/blacklist")
            .set("jwt", jwt)
            .end((err, res) => {
                res.should.have.status(200);
                done();
            });
    });

    step("Trying to access with blacklisted jwt", (done) => {
        chai.request(server)
            .get("/user")
            .end((err, res) => {
                res.should.have.status(401);
                done();
            });
    });
});

describe("Authorized user - role=admin", () => {
    let jwt;
    step("Obtain jwt", (done) => {
        chai.request(server)
            .get("/adminLogin")
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a("object");
                jwt = res.body.jwt;
                res.body.should.have.property("jwt");
                res.header["set-cookie"].should.have.length(1);
                done();
            });
    });
    step("Access admin page", (done) => {
        chai.request(server)
            .get("/admin")
            .set("jwt", jwt)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.message.should.equal("you are an admin");
                done();
            });
    });
});
