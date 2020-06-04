const jwt = require('jsonwebtoken');

module.exports.config = {}

module.exports.middleware =(req, res, next)=>{
    if(!this.config.restrictedArea.includes(req.path)){
        next();
        return;
    }
    jwt.verify(req.headers.jwt, this.config.secret, (err, decoded)=>{
        if(err){
            res.redirect(this.config.loginUrl);
            res.end();
        }else{
            next();
        }
    });
}

