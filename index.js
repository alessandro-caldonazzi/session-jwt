const jwt = require('jsonwebtoken');

module.exports.config = {}

module.exports.middleware = (req, res, next) => {
    if (!this.config.restrictedArea.includes(req.path)) {
        next();
        return;
    }

    jwt.verify(req.headers.jwt, this.config.secret, (err) => {
        if (err) {
            res.redirect(301, this.config.loginUrl);
            res.end();
        } else {
            next();
        }
    });

}

module.exports.settings = (secret, restrictedArea, loginUrl, options = { "refreshUrl": "/refresh" }) => {

    if (!secret) {
        throw 'Secret is required in settings function';
    }
    if (!restrictedArea) {
        throw 'restrictedArea is required in settings function';
    }
    if (!loginUrl) {
        throw 'loginUrl is required in settings function';
    }
    if (!Array.isArray(restrictedArea)) {
        throw 'restrictedArea must be an Array';
    }
    if (typeof secret !== 'string') {
        throw 'secret must be an string';
    }
    if (typeof loginUrl !== 'string') {
        throw 'loginUrl must be an string';
    }
    this.config.secret = secret;
    this.config.restrictedArea = restrictedArea;
    this.config.loginUrl = loginUrl;
    this.config.refreshUrl = options.refreshUrl
}

module.exports.newSession = (objData, callback) => {
    jwt.sign(objData, this.config.secret, (err, jwtToken) => {

        Object.assign(objData, { "isRefresh": true });
        jwt.sign(objData, this.config.secret, (err, refreshToken) => {

            callback(jwtToken, refreshToken)
        });
    });
}

module.exports.refresh = (req, callback) => {
    jwt.verify(req.cookies.refresh, this.config.secret, (err, obj) => {
        if (err) {
            callback(true);
        } else {
            jwt.sign(obj, this.config.secret, (err, jwt) => {
                callback(err, jwt);
            });
        }
    });
}