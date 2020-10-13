const jwt = require("jsonwebtoken");
var cookieParser = require("cookie-parser");

let blacklistCache = [],
    config;

module.exports.middleware = (req, res, next) => {
    if (this.config.unrestricted.includes(req.path)) {
        next();
        return;
    }

    jwt.verify(req.headers[this.config.JwtHeaderKeyName], this.config.secret, (err, decoded) => {
        if (err || blacklistCache.includes(req.headers[this.config.JwtHeaderKeyName])) {
            res.status(401).send("Invalid JWT token");
        } else if (!decoded.role || !this.config[decoded.role].includes(req.path)) {
            res.status(401).send("Permission denied");
        } else {
            req.session = decoded;
            next();
        }
    });

};

module.exports.importSession = (configJson) => {
    console.log(configJson.unrestricted);
    this.config = configJson;
};

/** 
 * @function settings - Use this function to setup the module
 * @param {String} secret - Secret used for jwt
 * @param {String} jwtHeaderKeyName - Name of the header key used to store the jwt
 */
module.exports.settings = (secret, jwtHeaderKeyName = "jwt") => {

    if (!secret) throw "secret is required in settings function";

    if (typeof secret !== "string") throw "secret must be a string";

    if (typeof jwtHeaderKeyName !== "string") throw "jwtHeaderKeyName must be a string";

    if (!this.config) this.config = {};
    this.config.secret = secret;
    this.config.JwtHeaderKeyName = jwtHeaderKeyName;
};


/** 
 * @function newSession - Create new session (generate jwt and refreshToken)
 * @param {Object} objData - Data to save in jwt
 * @param {Object} res - Express response, used to set refresh cookie
 * @param {String} role - Authorization level, listed in config file (only if you are using middleware)
 * @param {function (Object, Object)} [callback] - Optional function, called after calculating jwt and refreshToken
 * @returns {Promise} Return a promise with jwtToken and refreshToken as a Object
 */
module.exports.newSession = (objData, res, role = null, callback = null) => {
    return new Promise((resolve) => {
        Object.assign(objData, { role });
        jwt.sign(objData, this.config.secret, { expiresIn: 400 }, (err, jwtToken) => {

            Object.assign(objData, { "isRefresh": true });
            jwt.sign(objData, this.config.secret, (err, refreshToken) => {

                if (res) res.cookie("refresh", refreshToken, { maxAge: 90000000, httpOnly: true, secure: true });

                if (callback) callback(jwtToken, refreshToken);
                resolve({ jwtToken, refreshToken });
            });
        });
    });
};

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
};

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
};

module.exports.deleteRefresh = (res) => {
    res.clearCookie('refresh');
};

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