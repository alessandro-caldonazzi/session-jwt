const JWT = require("jsonwebtoken");
const errorMessages = require("./responses/errorMessages");
let blacklistCache = [];

module.exports.ensureAuth = async (req, res, next) => {
    const jwt = req.headers[this.config.JwtHeaderKeyName];
    if (blacklistCache.includes(jwt)) return errorMessages.blacklisted(res);

    JWT.verify(jwt, this.config.secret, (err, decoded) => {
        if (err || decoded.hasOwnProperty("isRefresh")) {
            return errorMessages.invalidJwt(res);
        }
        req.session = decoded;
        next();
    });
};

module.exports.importConfig = (configJson) => {
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
module.exports.newSessionInCookies = async (objData, res, role = null, callback = null) => {
    let sessionData = await this.newSession(objData, role, callback);

    if (res)
        res.cookie("refresh", sessionData.refreshToken, {
            maxAge: 90000000,
            httpOnly: true,
            secure: true,
        });
    return sessionData;
};

module.exports.newSession = (objData, role = null, callback = null) => {
    return new Promise((resolve) => {
        Object.assign(objData, { role });
        JWT.sign(objData, this.config.secret, { expiresIn: 400 }, (err, jwt) => {
            Object.assign(objData, { isRefresh: true });
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
            if (err || !obj.hasOwnProperty("isRefresh")) {
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

module.exports.hasRole = (role) => {
    return (req, res, next) => {
        if (req.session.role) return next();
        errorMessages.invalidRole(res);
    };
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
