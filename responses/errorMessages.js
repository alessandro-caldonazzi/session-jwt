const blacklistedMessage = "Your authentication token has been blacklisted";
const invalidRoleMessage = "You are not allowed to access this endpoint";
const invalidJwtMessage = "The jwt provided is invalid";

module.exports = {
    blacklisted: (res) => res.status(401).send({ error: blacklistedMessage }),
    invalidRole: (res) => res.status(401).send({ error: invalidRoleMessage }),
    invalidJwt: (res) => res.status(401).send({ error: invalidJwtMessage }),
};
