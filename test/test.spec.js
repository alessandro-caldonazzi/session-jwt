const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("./test-server");

chai.use(chaiHttp);
chai.should();

describe("utente non loggato", () => {
    it("non deve ricevere kk come response", (done) => {
        chai.request(server)
            .get("/")
            .end((err, res) => {
                res.should.have.status(200);
                res.text.should.not.equal("kk");
                res.body.should.not.equal("kk");
                done();
            });
    });
});

describe("utente loggato", () => {
    let jwt;
    step("recupero jwt loggando utente", (done) => {
        chai.request(server)
            .get("/login")
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a("object");
                jwt = res.body.jwt;
                done();
            });
    });

    step("Prova accesso area ristretta con jwt", (done) => {
        chai.request(server)
            .get("/")
            .set('jwt', jwt)
            .end((err, res) => {
                res.should.have.status(200);
                res.text.should.equal("kk");
                done();
            });
    });
});