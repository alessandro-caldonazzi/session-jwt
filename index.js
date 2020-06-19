const jwt = require("jsonwebtoken");

let blacklistCache = [];

module.exports.config = {};

module.exports.middleware = (req, res, next) => {
    if (!this.config.restrictedArea.includes(req.path)) {
        next();
        return;
    }

    jwt.verify(req.headers[this.config.JwtHeaderKeyName], this.config.secret, (err, decoded) => {
        if (err || blacklistCache.includes(req.headers[this.config.JwtHeaderKeyName])) {
            if (req.cookies.refresh !== undefined) {
                res.redirect(301, this.config.refreshUrl);
                res.end();
            } else {
                res.redirect(301, this.config.loginUrl);
                res.end();
            }
        } else {
            req.jwt = decoded;
            next();
        }
    });

};

/** 
 * @function settings - Use this function to setup the module
 * @param {String} secret - Secret used for jwt
 * @param {Array} restrictedArea - Array of string representing the endpoits where authentication is required
 * @param {String} loginUrl - Endpoit where the usere logs in
 * @param {Object} options - For example: option.refreshUrl contain a String repesenting the refresh endpoint
 */
module.exports.settings = (secret, restrictedArea, loginUrl, options = { "refreshUrl": "/refresh", "blacklisting": true, "JwtHeaderKeyName": "jwt" }) => {

    if (!secret) throw "secret is required in settings function";

    if (!restrictedArea) throw "restrictedArea is required in settings function";

    if (!loginUrl) throw "loginUrl is required in settings function";

    if (!Array.isArray(restrictedArea)) throw "restrictedArea must be an Array";

    if (typeof secret !== "string") throw "secret must be an string";

    if (typeof loginUrl !== "string") throw "loginUrl must be an string";


    this.config.secret = secret;
    this.config.restrictedArea = restrictedArea;
    this.config.loginUrl = loginUrl;
    this.config.refreshUrl = options.refreshUrl;
    this.config.blacklisting = options.blacklisting;
    this.config.JwtHeaderKeyName = options.JwtHeaderKeyName;
}


/** 
 * @function newSession - Create new session (generate jwt and refreshToken)
 * @param {Object} objData - Data to save in jwt
 * @param {function (Object, Object)} [callback] - Optional function, called after calculating jwt and refreshToken
 * @returns {Promise} Return a promise with jwtToken and refreshToken as a Object
 */
module.exports.newSession = (objData, callback) => {
    return new Promise((resolve) => {
        jwt.sign(objData, this.config.secret, { expiresIn: 400 }, (err, jwtToken) => {

            Object.assign(objData, { "isRefresh": true });
            jwt.sign(objData, this.config.secret, (err, refreshToken) => {

                if (callback) callback(jwtToken, refreshToken);
                resolve({ jwtToken, refreshToken });
            });
        });
    });
}

/**
 * @function refresh - Recreate jwt if there is a valid refreshToken in req as cookie
 * @param {Object} req - Express request
 * @param {function (Boolean, Object)} [callback] - Optional function, called after calculating jwt 
 * @returns {Promise} - Return a promise with jwtToken
 */
module.exports.refresh = (req, callback) => {
    return new Promise((resolve) => {
        jwt.verify(req.cookies.refresh, this.config.secret, (err, obj) => {
            if (err) {
                if (callback) callback(true);
                resolve(null);
            } else {
                delete obj.isRefresh;
                delete obj.iat;
                jwt.sign(obj, this.config.secret, { expiresIn: 400 }, (err, jwt) => {
                    if (callback) callback(err, jwt);
                    resolve(jwt);
                });
            }
        });
    });
}

/**
 * @function blacklist - blacklist an jwt if blacklisting is enable in config
 * @param {String} jwt - Jwt to blacklist
 * @returns {Boolean} - Operation status
 */
module.exports.blacklist = (jwt) => {
    return new Promise((resolve, reject) => {
        if (this.config.blacklisting) {
            blacklistCache.push(jwt);
            resolve(true);
        } else {
            reject("To blacklist an jwt you need to enable blacklisting in settings");
        }
    });
}

module.exports.deleteRefresh = (res) => {
    res.clearCookie('refresh');
}

//function that remove expired jwt from blacklistcache every 2 minute
let intervalID = setInterval(() => {
    for (let index = 0; index < blacklistCache.length; index++) {
        const element = blacklistCache[parseInt(index, 10)];

        jwt.verify(element, this.config.secret, (err, obj) => {
            if (err) {
                blacklistCache.splice(index, 1);
                console.log("eliminato: ");
                console.log(element);
            }
        });
    }
}, 2 * 60 * 60);