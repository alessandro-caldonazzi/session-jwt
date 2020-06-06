const jwt = require('jsonwebtoken');

module.exports.config = {}

module.exports.middleware = (req, res, next) => {
    if (!this.config.restrictedArea.includes(req.path)) {
        next();
        return;
    }

    jwt.verify(req.headers.jwt, this.config.secret, (err) => {
        if (err) {
            res.redirect(this.config.loginUrl);
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

module.exports.newSession = (objData) => {

    let jwtToken = jwt.sign(objData, this.config.secret);
    Object.assign(objData, { "isRefresh": true });
    let refreshToken = jwt.sign(objData, this.config.secret);
    return [
        jwtToken,
        refreshToken
    ]

}