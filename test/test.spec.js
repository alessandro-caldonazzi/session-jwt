const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("./test-server");

chai.use(chaiHttp);
chai.should();

describe("utente non loggato", () => {
    it("non deve ricevere kk come response", (done) => {
        chai.request(server)
            .get("/user")
            .end((err, res) => {
                res.should.have.status(401);
                done();
            });
    });
});

describe("utente loggato", () => {
    let jwt, cookie;
    step("recupero jwt loggando utente", (done) => {
        chai.request(server)
            .get("/login")
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a("object");
                jwt = res.body.jwt;
                res.body.should.have.property('jwt');
                res.header['set-cookie'].should.have.length(1);
                cookie = res.header['set-cookie'];
                done();
            });
    });

    step("Prova accesso area ristretta con jwt", (done) => {
        chai.request(server)
            .get("/user")
            .set("jwt", jwt)
            .end((err, res) => {
                res.should.have.status(200);
                res.text.should.equal("kk");
                done();
            });
    });

    step("Prova refresh senza jwt", (done) => {
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

    /*
    step("Blacklist this jwt", (done) => {
        chai.request(server)
            .get("/blacklist")
            .set('jwt', jwt)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a("object");
                res.body.should.have.property("blacklist");
                res.body.blacklist.should.be.true;
                done();
            });
    });

    step("Prova richiesta con jwt bannato", (done) => {
        chai.request(server)
            .get("/user")
            .end((err, res) => {
                res.should.have.status(200);
                res.text.should.not.equal("kk");
                res.body.should.not.equal("kk");
                done();
            });
    });
    */
});