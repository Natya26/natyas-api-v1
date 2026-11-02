var jwt = require('jsonwebtoken');

function verifyToken(token, secretOrPem, ignore = false) {
    return new Promise((resolve, reject) => {
        jwt.verify(token, secretOrPem, { ignoreExpiration: ignore }, function (err, payload) {
            if (err) {
                reject(err)
            } else {
                resolve(payload);
            }
        });
    });
}

function generateToken(payload, secretOrPem, expiry) {
    let token;
    if (expiry) token = jwt.sign(payload, secretOrPem, { expiresIn: expiry });
    else token = jwt.sign(payload, secretOrPem);
    return token;
}
function decodeToken(payload, secretOrPem) {
    var decoded = jwt.decode(payload);
    return decoded;
}

module.exports = {
    verifyToken,
    generateToken,
    decodeToken
}