const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../test-server');

chai.use(chaiHttp);
chai.should();

describe('utente non loggato', () => {
  it('non deve ricevere kk come response', (done) => {
    chai.request(server)
                 .get('/')
                 .end((err, res) => {
                     res.should.have.status(200);
                     res.body.should.not.equal("kk");
                     done();
                  });
    
  });
});