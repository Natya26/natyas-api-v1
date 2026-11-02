const jwtAuth = require('./jwt-auth');
const APIError = require('../errors/APIError');
const db = require('./../db');
async function authMiddleware(req, res, next) {
    const Authorization = req.header('Authorization');
    if (Authorization) {
        try {
            const values = Authorization.split(' ');
            if (values.length === 2) {
                const method = values[0];
                const token = values[1];
                if (!(method === 'JWT')) new APIError(401, 'Unsupported Authentication');
                const payload = await jwtAuth.verifyToken(token,process.env.JWT_KEY);
                req.auth = payload;
            }
            else next(new APIError(401, 'Invalid access token provided'));
        } catch (e) {
            next(new APIError(401, 'Invalid access token provided'));
        }
    }
    else {
        next(new APIError(401, 'Access Token required to access the route'));
    }
    next();
}

async function idMiddleware(req, res, next) {
    const ID = req.header('ID');
    if (ID) {
        try {
            const payload = await jwtAuth.verifyToken(ID, process.env.JWT_KEY);
            let isValidToken = true;
            Object.getOwnPropertyNames(payload).forEach(key => !['user', 'token', 'iat'].includes(key) && (isValidToken = false));
            if (!isValidToken) return next(new APIError(401, 'INVALID_TOKEN'));
            req.user = payload.user;
            req.token = payload.token;
            process.env.lang = req.lang;
        } catch (e) {
            next(new APIError(401, 'Invalid ID token provided'));
        }
    }
    else {
        next(new APIError(401, 'ID Token required to access the route'));
    }
    next();
}

const ROLES = Object.freeze({
    ADMIN: 'ADMIN',
    SUBSCRIBER: 'SUBSCRIBER'
});

function roleAuthMiddleware(allowedRoles = []) {
    return async (req, res, next) => {
        const hasRole = allowedRoles.includes(req.user.user_type);
        if (!hasRole) next(new APIError(401, 'User access to this route has been denied'));
        next();
    };
}

async function sessionTokenMiddleware(req, res, next) {
    const token = req.token;
    if (token) {
        try {
            const userToken = await db.getQueryBuilder('user_session_tokens')
                .where('user_id', req.user.id)
                .first();
            if (!userToken) return next(new APIError(401, 'INVALID_TOKEN'));
            if (!userToken.token) return next(new APIError(401, 'INVALID_TOKEN'));
            if (userToken.token !== token) return next(new APIError(401, 'INVALID_TOKEN'));
        } catch (e) {
            next(new APIError(401, 'INVALID_TOKEN'));
        }
    }
    else {
        next(new APIError(401, 'INVALID_TOKEN'));
    }
    next();
}

module.exports = { authMiddleware, idMiddleware, ROLES, roleAuthMiddleware, sessionTokenMiddleware };