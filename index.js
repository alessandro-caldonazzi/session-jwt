import { verify, sign } from 'jsonwebtoken';

export const config = {}

export function middleware(req, res, next) {
    if (!this.config.restrictedArea.includes(req.path)) {
        next();
        return;
    }

    verify(req.headers.jwt, this.config.secret, (err) => {
        if (err) {
            res.redirect(301, this.config.loginUrl);
            res.end();
        } else {
            next();
        }
    });

}

export function settings(secret, restrictedArea, loginUrl, options = { "refreshUrl": "/refresh" }) {

    if (!secret) throw 'secret is required in settings function';

    if (!restrictedArea) throw 'restrictedArea is required in settings function';

    if (!loginUrl) throw 'loginUrl is required in settings function';

    if (!Array.isArray(restrictedArea)) throw 'restrictedArea must be an Array';

    if (typeof secret !== 'string') throw 'secret must be an string';

    if (typeof loginUrl !== 'string') throw 'loginUrl must be an string';


    this.config.secret = secret;
    this.config.restrictedArea = restrictedArea;
    this.config.loginUrl = loginUrl;
    this.config.refreshUrl = options.refreshUrl
}

export function newSession(objData, callback) {
    return new Promise((resolve) => {
        sign(objData, this.config.secret, (err, jwtToken) => {

            Object.assign(objData, { "isRefresh": true });
            sign(objData, this.config.secret, (err, refreshToken) => {

                if (callback) callback(jwtToken, refreshToken);
                resolve({ jwtToken, refreshToken })
            });
        });
    });
}

export function refresh(req, callback) {
    return new Promise((resolve) => {
        verify(req.cookies.refresh, this.config.secret, (err, obj) => {
            if (err) {
                if (callback) callback(true);
                resolve(null);
            } else {
                sign(obj, this.config.secret, (err, jwt) => {
                    if (callback) callback(err, jwt);
                    resolve(jwt);
                });
            }
        });
    });
}