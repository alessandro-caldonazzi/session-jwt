const JWT = require("jsonwebtoken");
var cookieParser = require("cookie-parser");

let blacklistCache = [],
    config;

module.exports.middleware = (req, res, next) => {
    if (this.config.unrestricted.includes(req.path)) {
        next();
        return;
    }

    JWT.verify(req.headers[this.config.JwtHeaderKeyName], this.config.secret, (err, decoded) => {
        if (err || blacklistCache.includes(req.headers[this.config.JwtHeaderKeyName]) || decoded.hasOwnProperty('isRefresh')) {
            res.status(401).send("Invalid JWT token");
        } else if (decoded.role && !this.config[decoded.role].includes(req.path)) {
            res.status(401).send("Permission denied");
        } else {
            req.session = decoded;
            next();
        }
    });

};

module.exports.ensureAuth = async(req, res, next) => {
    JWT.verify(req.headers[this.config.JwtHeaderKeyName], this.config.secret, (err, decoded) => {
        if (!err && !decoded.hasOwnProperty('isRefresh')) {
            req.session = decoded;
            next();
        } else {
            res.status(401).json({ "error": "Invalid JWT token" });
        }
    });
};

module.exports.importConfig = (configJson) => {
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
 * @function newSession - Create new session (generate jwt and refreshToken) and save refereshToken in a cookie
 * @param {Object} objData - Data to save in jwt
 * @param {Object} res - Express response, used to set refresh cookie
 * @param {String} role - Authorization level, listed in config file (only if you are using middleware)
 * @param {function (Object, Object)} [callback] - Optional function, called after calculating jwt and refreshToken
 * @returns {Promise} Return a promise with jwtToken and refreshToken as a Object
 */
module.exports.newSessionInCookies = async(objData, res, role = null, callback = null) => {
    let sessionData = await this.newSession(objData, role, callback);

    if (res) res.cookie("refresh", sessionData.refreshToken, { maxAge: 90000000, httpOnly: true, secure: true });
    return sessionData;
};

module.exports.newSession = (objData, role = null, callback = null) => {
    return new Promise((resolve) => {
        Object.assign(objData, { role });
        JWT.sign(objData, this.config.secret, { expiresIn: 400 }, (err, jwt) => {

            Object.assign(objData, { "isRefresh": true });
            JWT.sign(objData, this.config.secret, (err, refreshToken) => {
                if (callback) callback(jwt, refreshToken);
                resolve({ jwt, refreshToken });
            });
        });
    });
};

/**
 * @function refresh - Recreate jwt if there is a valid refreshToken in req as cookie
 * @param {Object} req - Express request
 * @param {function (Object)} [callback] - Optional function, called after calculating jwt 
 * @returns {Promise} - Return a promise with jwtToken
 */
module.exports.refreshFromCookie = (req, callback) => {
    return this.refresh(req.cookies.refresh, callback);
};

/**
 * @function refresh - Recreate jwt if the refreshToken is valid
 * @param {function (Object)} [callback] - Optional function, called after calculating jwt
 * @returns {Promise} - Return a promise with jwtToken
 */
module.exports.refresh = (refreshToken, callback) => {
    return new Promise((resolve, reject) => {
        JWT.verify(refreshToken, this.config.secret, (err, obj) => {
            if (err || !obj.hasOwnProperty('isRefresh')) {
                if (callback) callback(err);
                reject(err);
            } else {
                delete obj.isRefresh;
                delete obj.iat;
                JWT.sign(obj, this.config.secret, { expiresIn: 400 }, (err, jwt) => {
                    if (callback) callback(jwt);
                    resolve(jwt);
                });
            }
        });
    });
};

/**
 * @function blacklist - blacklist an jwt if blacklisting is enable in config
 * @param {String} jwt - Jwt to blacklist
 */
module.exports.blacklist = (jwt) => {
    blacklistCache.push(jwt);
};

module.exports.deleteRefresh = (res) => {
    res.clearCookie("refresh");
};

/**
 * @function getSession - getSession from request, provide feedback on session validity
 * @param {Object} req - Express request object
 * @returns {Promise} - Operation status, decoded jwt
 */
module.exports.getSession = (req) => {
    return new Promise((resolve, reject) => {
        JWT.verify(req.headers[this.config.JwtHeaderKeyName], this.config.secret, (err, decoded) => {
            if (err || blacklistCache.includes(req.headers[this.config.JwtHeaderKeyName]) || decoded.hasOwnProperty('isRefresh')) {
                reject("Invalid JWT");
            } else if (decoded.role && !this.config[decoded.role].includes(req.path)) {
                reject("Permission Denied");
            } else {
                resolve(decoded);
            }
        });
    });
};

//function that remove expired jwt from blacklistcache every 2 minute
let intervalID = setInterval(() => {
    for (let index = 0; index < blacklistCache.length; index++) {
        const element = blacklistCache[parseInt(index, 10)];

        JWT.verify(element, this.config.secret, (err, obj) => {
            if (err) {
                blacklistCache.splice(index, 1);
            }
        });
    }
}, 2 * 60 * 60);