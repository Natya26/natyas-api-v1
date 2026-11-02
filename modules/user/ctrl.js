const { logFmt, apiFmt } = require('../services/fmt');
const APIError = require('../errors/APIError');
const UserClient = require('../authentication/user');
const userClient = new UserClient()
const { validationResult, body, param } = require('express-validator');
const utils = require('../utils');
const db = require('../db');
const jwtAuth = require('../authentication/jwt-auth');
const { pageOffset } = require('../utils');
const bcrypt = require('bcryptjs');
const moment = require('moment');
const { deleteFile, getFile, uploadImage } = require('../s3/');
const SubscriptionClient = require('./../subscriptions/subscription');
const models = require('./../db/models');

async function getUser(req, res, next) {
    try {
        const query = db.getQueryBuilder('users')
            .select('users.*')
            .where('users.id', req.user.id).first()
        let response = await db.executeQuery(query)
        response = await userClient.attatchDetails(response)
        res.json(apiFmt(response));
    } catch (e) {
        next(e);
    }
}

// async function authenticatePusher(req, res, next) {
//     try {
//         validateRequest(req)
//         const socketId = req.body.socket_id;
//         const channel = req.body.channel_name;
//         let pusher = await pusherClient();
//         const auth = await pusher.authenticate(socketId, channel);
//         res.json(apiFmt(auth));
//     } catch (e) {
//         next(e)
//     }
// };
async function updateUser(req, res, next) {
    try {
        validateRequest(req);
        const userId = req.user.id;
        const file = req.file;
        var updateBody = {
            first_name: req.body.first_name || req.user.first_name,
            last_name: req.body.last_name || req.user.last_name,
            photo: req.body.photo || req.user.photo,
            authId: req.body.email || req.user.authId,
            email: req.body.email || req.user.email,
            gender: req.body.gender || req.user.gender,
            phone_code: req.body.phone_code || req.user.phone_code,
            phone_number: req.body.phone || req.user.phone_number,
            date_of_birth: req.body.date_of_birth || req.user.date_of_birth,
            country_code: req.body.country_code || req.user.country_code,
        };
        const validUser = await db.getQueryBuilder('users')
            .where('id', userId)
            .where('active', true)
            .first();
        if (!validUser) throw new APIError(400, 'Invalid user');
        const exists = await db.getQueryBuilder('users')
            .where((query) => 
                query.where({
                    'phone_code': updateBody.phone_code,
                    'phone_number': updateBody.phone_number,
                })
                .orWhere({ 'email': updateBody.email })
            )
            .where('id', '!=', userId)
            .first();
        if (exists) throw new APIError(400, 'Email/Phone Number already in use');
        if (file) {
            file.s3Key = `${userId}/profile/${file.filename}`;
            const key = await uploadImage(file);
            updateBody['photo'] = key;
        }
        let { oldPassword, newPassword } = req.body;
        let flag = false;
        if (oldPassword && newPassword) {
            flag = await passwordChange(req);
        }
        Object.keys(updateBody).forEach(key => (updateBody[key] == null || updateBody[key] == undefined) && delete updateBody[key]);
        let response = await db.updateDoc('users', userId, updateBody);
        const token = await userClient.generateSessionToken();
        await userClient.addToUserSessionTokens(response.id, token);
        response = await userClient.attatchDetails(response);
        let idToken = await jwtAuth.generateToken({ token, user: response }, process.env.JWT_KEY);
        let accessToken = await jwtAuth.generateToken(req.auth, process.env.JWT_KEY);
        let refreshToken = await jwtAuth.generateToken(req.auth, process.env.JWT_KEY);
        res.json(apiFmt({ accessToken, idToken, refreshToken, user: response, passwordChangeStatus: flag }, 'Profile Updated Successfully'));
    } catch (e) {
        // if (e.code === 'ExpiredCodeException' || e.code === 'CodeMismatchException') {
        //     next(new APIError(400, e.message));
        // }
        console.error(e);
        next(e);
    }
}
async function passwordChange(req) {
    try {
        let { phone, phone_code:phoneCode, oldPassword, newPassword } = req.body;
        if (!phone) phone = req.user.phone_number;
        if (!phoneCode) phoneCode = req.user.phone_code;
        let confirmUser = await userClient.getUser(phone, phoneCode);
        console.log(confirmUser);
        let userValid = await bcrypt.compare(oldPassword, confirmUser.password);
        console.log(userValid);
        let flag = false
        if (userValid == true) {
            let password = await userClient.generateSalt(newPassword)
            console.log(password)
            let updateAuth = await db.updateDoc('authentication', confirmUser.id, { password: password })
            confirmUser.update = updateAuth
            flag = true
        }
        return flag
    } catch (e) {

    }
}
async function changePassword(req, res, next) {
    try {
        validateRequest(req);
        let flag = await passwordChange(req);
        if (flag == true)
            res.json(apiFmt('Profile Updated successfully'));
        else throw new APIError(401, 'Invalid Password')
    } catch (e) {
        console.error(e);
        next(e);
    }
}

async function updateActive(req, res, next) {
    try {
        var { active } = req.params;
        if (active == 'true') active = true
        else active = false;
        let response = await db.updateDoc('users', req.user.id, { active: active })
        response = await userClient.attatchDetails(response)
        const idToken = jwtAuth.generateToken(response, process.env.JWT_KEY);
        response.idToken = idToken
        res.json(apiFmt(response))
    } catch (e) {
        next(e)
    }
}

async function updatePreferredLanguage(req, res, next) {
    try {
        var { language } = req.body;
        let response = await db.updateDoc('users', req.user.id, { preferredLanguage: language })
        response = await userClient.attatchDetails(response)
        const idToken = jwtAuth.generateToken(response, process.env.JWT_KEY);
        response.idToken = idToken
        console.log(response)
        res.json(apiFmt(response))
    } catch (e) {
        console.log('user 73:', e)
        next(e)
    }
}
async function adminConfirmSignup(req, res, next) {
    try {
        const username = req.body.phone;
        const phoneCode = req.body.phone_code;
        let authUser = await userClient.getUser(username, phoneCode)
        if (!authUser) throw new APIError(401, 'User not found')
        let response = await db.updateWithCondition('authentication', { userId: authUser.userId }, { active: true })
        res.json(apiFmt({ status: 'SUCCESS', userId: authUser.userId }, 'User Confirmed successfully'));
    } catch (e) {
        next(e)
    }
}
async function adminGetUsers(req, res, next) {
    try {
        let search = req.query.search || '';
        let { order, userActive, type, orderBy } = req.query;
        if (orderBy && ['asc', 'desc'].includes(orderBy) == true) orderBy = orderBy
        else orderBy = 'asc'
        if (type && ['DRIVER', 'CLIENT', 'SERVICE_PROVIDER', 'ADMIN'].includes(type) == true) type = [type]
        else type = ['DRIVER', 'CLIENT', 'SERVICE_PROVIDER', 'ADMIN']
        if (userActive) {
            if (userActive == 'true') userActive = [true]
            else if (userActive == 'false') userActive = [false]
            else userActive = [true, false]

        } else userActive = [true, false]
        const countQuery = db.getQueryBuilder('users')
            .countDistinct('users.id')
            .where('users.phone_number', 'ilike', `%${search}%`)
            .leftJoin('authentication as au', function () {
                this.on('au.userId', '=', 'users.id')
            })
            .whereIn('au.active', userActive)
            .whereIn('users.type', type)
            .first()
        const { count } = await db.executeQuery(countQuery)
        // let { offset, limit } = await pageOffset(req, count);
        let offset = req.query.offset || 0;
        let limit = req.query.limit || count;
        let query = db.getQueryBuilder('users')
            .select('users.*', 'au.active as userActive')
            .where('users.phone_number', 'ilike', `%${search}%`)
            .leftJoin('authentication as au', function () {
                this.on('au.userId', '=', 'users.id')
            })
            .limit(limit).offset(offset)
            .orderBy('users.name', orderBy)//.groupBy('users.id', 'au.active')
            .whereIn('au.active', userActive)
            .whereIn('users.type', type)
        if (order && ['type', 'created_at', 'lastLogin', 'name', 'countryCode', 'userActive'].includes(order) == true)
            query = query.clearOrder()
                .orderBy(order)
        const response = await db.executeQuery(query)
        res.json(apiFmt({ total: count, users: response }));
    } catch (e) {
        next(e);
    }
}
async function deleteUser(req, res, next) {
    try {
        let user, deleteSP = 0, deleteDriver, drivers, deleteSPV = 0, response, walletDel = 0, userDel = 0;
        let { id } = req.params;
        if (id) {
            let userQuery = db.getQueryBuilder('users').where({ id }).first()
            user = await db.executeQuery(userQuery)
            console.log(user)
            if (!user) throw new APIError(400, 'user not found')
        }
        else {
            user = req.user
        }
        if (user.type == 'ADMIN') throw new APIError(400, 'Can not delete ADMIN')
        if (user.type == 'DRIVER') {
            deleteDriver = await db.deleteDoc('driver', { username: user.phone_number })
            response = { driver: deleteDriver }
        }
        if (req.user.type == 'SERVICE_PROVIDER') {
            const query = db.getQueryBuilder('driver')
                .select(db.createRaw(`array_agg(driver.username) as drivers,array_agg(users.id) as ids`))
                .where({ 'driver.spId': user.id })
                .whereNotNull('users.id')
                .leftJoin('users', function () {
                    this.on('driver.username', '=', 'users.phone_number')
                })
                .whereNotIn('username', [user.phone_number])
                .first()
            drivers = await db.executeQuery(query)
            console.log(drivers)
            if (drivers.drivers) {
                deleteSP = await db.getQueryBuilder('driver').where({ spId: user.id }).del();
                deleteSPV = await db.getQueryBuilder('sp-vehicle').where({ userId: user.id }).del();
                if (drivers.ids) {
                    walletDel += await db.getQueryBuilder('wallet').whereIn('userId', drivers.ids).del();
                    userDel += await db.getQueryBuilder('users').whereIn('id', drivers.ids).del();
                }
                response = { driver: deleteSP, spVehicle: deleteSPV, wallet: walletDel, drivers: userDel }
            }
        }
        userDel += await db.deleteDoc('users', { id: user.id })
        walletDel += await db.deleteDoc('wallet', { userId: user.id })
        console.log(response)
        res.json(apiFmt({ ...response, users: userDel, wallet: walletDel }, 'SUCCESS'));

    } catch (e) {
        next(e);
    }
}

async function subscribeWeb(req, res, next) {
    try {
        validateRequest(req)
        var { web_player_id } = req.body;
        let response = await db.updateDoc('users', req.user.id, { web_player_id: web_player_id })
        let playerids = response.playerids
        playerids = playerids.filter(x => x != web_player_id)
        playerids.push(web_player_id)
        response = await db.updateDoc('users', req.user.id, { playerids: playerids })
        response = await userClient.attatchDetails(response)
        const idToken = jwtAuth.generateToken(response, process.env.JWT_KEY);
        response.idToken = idToken
        res.json(apiFmt(response))
    } catch (e) {
        next(e)
    }
}

async function unsubscribeWeb(req, res, next) {
    try {
        let response = await db.updateDoc('users', req.user.id, { web_player_id: null })
        response = await userClient.attatchDetails(response)
        const idToken = jwtAuth.generateToken(response, process.env.JWT_KEY);
        response.idToken = idToken
        res.json(apiFmt(response))
    } catch (e) {
        next(e)
    }
}

async function subscribeMobile(req, res, next) {
    try {
        validateRequest(req)
        var { mobile_player_id } = req.body;
        let response = await db.updateDoc('users', req.user.id, { mobile_player_id: mobile_player_id })
        let playerids = response.playerids
        playerids = playerids.filter(x => x != mobile_player_id)
        playerids.push(mobile_player_id)
        response = await db.updateDoc('users', req.user.id, { playerids: playerids })
        response = await userClient.attatchDetails(response)
        const idToken = jwtAuth.generateToken(response, process.env.JWT_KEY);
        response.idToken = idToken
        res.json(apiFmt(response))
    } catch (e) {
        next(e)
    }
}

async function subscribe(req, res, next) {
    try {
        validateRequest(req)
        var { player_id } = req.body;
        let user = await db.getQueryBuilder('users').where({ id: req.user.id }).first()
        let playerids = user.playerids
        playerids = playerids.filter(x => x != player_id)
        playerids.push(player_id)
        let response = await db.updateDoc('users', req.user.id, { playerids: playerids })
        response = await userClient.attatchDetails(response)
        const idToken = jwtAuth.generateToken(response, process.env.JWT_KEY);
        response.idToken = idToken
        res.json(apiFmt(response))
    } catch (e) {
        next(e)
    }
}

async function unsubscribe(req, res, next) {
    try {
        validateRequest(req)
        var { player_id } = req.body;
        let user = await db.getQueryBuilder('users').where({ id: req.user.id }).first()
        let playerids = user.playerids
        playerids = playerids.filter(x => x != player_id)
        let response = await db.updateDoc('users', req.user.id, { playerids: playerids })
        response = await userClient.attatchDetails(response)
        const idToken = jwtAuth.generateToken(response, process.env.JWT_KEY);
        response.idToken = idToken
        res.json(apiFmt(response))
    } catch (e) {
        next(e)
    }
}

async function unsubscribeMobile(req, res, next) {
    try {
        let response = await db.updateDoc('users', req.user.id, { mobile_player_id: null })
        response = await userClient.attatchDetails(response)
        const idToken = jwtAuth.generateToken(response, process.env.JWT_KEY);
        response.idToken = idToken
        res.json(apiFmt(response))
    } catch (e) {
        next(e)
    }
}

async function updateNotification(req, res, next) {
    try {
        var { id } = req.params;
        let whereCondition = { id, userId: req.user.id }
        Object.keys(whereCondition).forEach(key => (whereCondition[key] == null || whereCondition[key] == undefined) && delete whereCondition[key])
        let response = await db.updateWithCondition('notification', whereCondition, { viewed: true })
        res.json(apiFmt(response))
    } catch (e) {
        next(e)
    }
}

async function getNotification(req, res, next) {
    try {
        let { id } = req.params;
        const lang = req.lang || 'en';
        var userId = id || req.user.id;
        const countQuery = db.getQueryBuilder('notification')
            .where({ userId, language: lang })
        const count = await db.getCount(countQuery);
        const unreadCountQuery = db.getQueryBuilder('notification')
            .where({ userId, language: lang, viewed: false })
        const unreadCount = await db.getCount(unreadCountQuery);
        let { offset, limit } = await pageOffset(req, count);
        const query = db.getQueryBuilder('notification')
            .where({ userId, language: lang })
            .orderBy('created_at', 'desc')
            .limit(limit).offset(offset);
        let response = await db.executeQuery(query)
        res.json(apiFmt({ total: count, unreadCount, notifications: response }))
    } catch (e) {
        next(e)
    }
}

function validate(method) {
    switch (method) {
        case 'update': {
            return [
                body('first_name', 'first_name is a required field').exists().notEmpty().isString(),
                body('last_name', 'last_name is a required field').exists().notEmpty().isString(),
                body('country_code', 'country_code is a required field').exists().notEmpty().isString(),
                body('email', 'Invalid email').optional({ nullable: true }).isEmail(),
                body('gender', 'Invalid gender').optional({ nullable: true }).notEmpty().isString(),
                body('date_of_birth', 'Invalid date').optional({ nullable: true }).notEmpty().isISO8601(),
                body('photo').optional({ nullable: true }).isString(),
                body('phone', 'phone number type mismatch').optional({ nullable: true }).isMobilePhone(),
                body('phone_code', 'phone_code type mismatch').optional({ nullable: true }).isInt(),
            ]
        }
        case 'update-language': {
            return [
                body('language', 'language preferred is a required field').exists().isString()
            ]
        }
        case 'subscribe-web': {
            return [
                body('web_player_id', 'web_player_id is a required field').exists().isString()
            ]
        }
        case 'subscribe-mobile': {
            return [
                body('mobile_player_id', 'mobile_player_id is a required field').exists().isString()
            ]
        }
        case 'subscribe': {
            return [
                body('player_id', 'player_id is a required field').exists().isString()
            ]
        }
        // case 'pusher-auth': {
        //     return [
        //         body('socket_id', 'socket_id is a required field').exists(),
        //         body('channel_name', 'channel_name is a required field').exists()
        //     ]
        // }
        case 'changePassword': {
            return [
                body('phone', 'phone is a required field').exists().isString(),
                body('oldPassword', 'oldPassword is a required field').exists().isString(),
                body('newPassword', 'newPassword is a required field').exists().isString()
            ]
        }
        case 'setSecurityPin': {
            return [
                body('type', 'type is a required field').exists().notEmpty().custom((type) => {
                    if (type && !['CREATE', 'UPDATE'].includes(type))
                        throw new Error("The value for 'type' must be 'CREATE'/'UPDATE'");
                    return true;
                }),
                body('pin', 'pin is a required field').exists().isNumeric(),
                body('cpin', 'cpin is a required field').exists().isNumeric().bail()
                    .custom((v, { req }) => {
                        if (req.body.pin && v && (req.body.pin == v)) return true;
                        throw new Error('cpin must be equal to pin');
                    })
            ]
        }
        case 'handleSecurityPinAuth': {
            return [
                body('pin', 'pin is a required field').exists().notEmpty().isNumeric()
            ]
        }
        case 'handleGetUser': {
            return [
                param('user_id').exists().isString().custom((val, { req }) => {
                    if (val === ':user_id') throw new Error('Invalid User Id');
                    return true;
                }),
            ];
        }
        case 'handleRestrictUser': {
            return [
                param('user_id').exists().isString().custom((val, { req }) => {
                    if (val === ':user_id') throw new Error('Invalid User Id');
                    return true;
                }),
                body('is_restricted').exists().isBoolean(),
                body('restricted_for').exists().isString().trim().escape(),
            ];
        }
        case 'handleDeleteUser': {
            return [
                body('id').exists().notEmpty().isString().trim().escape(),
            ];
        }
        default: {
            return [];
        }
    }
}
function validateRequest(req) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new APIError(400, "Invalid request", errors);
    }
}

const addSecurityPin = async (req) => {
    return new Promise(async (resolve, reject) => {
        try {
            const userAuth = await userClient.getUser(req.user.phone_number, req.user.phone_code);
            if (userAuth.pin && req.body.type === 'CREATE') throw new APIError(400, 'PIN ALREADY SET');
            if (!userAuth.pin && req.body.type === 'UPDATE') throw new APIError(400, 'PLEASE SET A PIN FIRST');
            if (req.body.type === 'UPDATE') {
                const isPinSimilar = await bcrypt.compare(req.body.pin, userAuth.pin);
                if (isPinSimilar) throw new APIError(400, 'PLEASE CHOOSE A DIFFERENT PIN');
            }
            const pin = await userClient.generateSalt(req.body.pin);
            var updateBody = { pin };
            Object.keys(updateBody).forEach(key => (!updateBody[key]) && delete updateBody[key]);
            let auth = await db.updateDoc('authentication', req.auth.id, updateBody);
            let userQuery = db.getQueryBuilder('users');
            let user = await userQuery.where({ id: auth.userId }).first();
            let response = await userClient.loginResponse(user, auth, req.token);
            resolve(response);
        } catch (e) {
            reject(e);
        }
    });
}

const setSecurityPin = async (req, res, next) => {
    try {
        validateRequest(req);
        let response = await addSecurityPin(req);
        res.json(apiFmt(response,'Pin Set Successfully'));
    } catch (e) {
        console.log(e);
        next(e);
    }
}

const securityPinAuth = async (req) => {
    return new Promise(async (resolve, reject) => {
        try {
            const username = req.user.phone_number || req.user.email
            const confirmUser = await userClient.getUser(username, req.user.phone_code);
            if (!confirmUser)
                throw new APIError(401, 'Invalid User');
            if (!confirmUser.pin)
                throw new APIError(400, 'Please create user security pin');
            console.log(confirmUser.pin, req.body.pin);
            const isValidPin = await bcrypt.compare(req.body.pin, confirmUser.pin);
            if (!isValidPin)
                throw new APIError(401, 'Incorrect pin');
            const userQuery = db.getQueryBuilder('users');
            const user = await userQuery.where({ id: req.user.id }).first();
            resolve({ user });
        } catch (e) {
            reject(e)
        }
    });
}

const handleSecurityPinAuth = async (req, res, next) => {
    try {
        validateRequest(req);
        const response = await securityPinAuth(req);
        res.json(apiFmt(response, 'Security Pin Auth Successful'));
    } catch (e) {
        console.log(e);
        next(e);
    }
}

const handleLogout = async (req, res, next) => {
    try {
        const username = req.user.phone_number || req.user.email
        const confirmUser = await userClient.getUser(username, req.user.phone_code);
        if (!confirmUser)
                throw new APIError(401, 'Invalid User');
        await db.getQueryBuilder('user_session_tokens')
            .where('user_id', req.user.id)
            .update({ 'token': '' });
        res.json(apiFmt(undefined, 'Logged out successfully'));
    } catch (e) {
        console.log(e);
        next(e);
    }
}

const handleAddProfilePic = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const file = req.file;
        file.s3Key = `${userId}/profile/${file.filename}`;
        const key = await uploadImage(file);
        const updateBody = { photo: key};
        let response = await db.updateDoc('users', req.user.id, updateBody);
        response = await userClient.attatchDetails(response);
        const idToken = await jwtAuth.generateToken({token: req.token, user: response}, process.env.JWT_KEY);
        res.json(apiFmt({ idToken: idToken, user: response }, 'Profile Updated Successfully'));        
    } catch (e) {
        console.log(e);
        next(e);
    }
}

const handleGetUserSubscription = async (req, res, next) => {
    try {
        const subscription = await SubscriptionClient.getSubscription()
            .where('subscriptions.user_id', req.user.id) ?? null;
        let status = 'ACTIVE';
        if (!subscription || (subscription && !subscription.active)) status = 'NO_SUBSCRIPTION';
        const now = moment().toISOString();
        if (subscription && moment(now).diff(subscription.valid_till, 'milliseconds') > 0) status = 'EXPIRED';
        let response = { status, subscription: subscription };
        return res.json(apiFmt(response, 'SUCCESS'));
    } catch (e) {
        console.log('handleGetUserSubscription --- ERROR', e);
        next(e);
    }
}

const handleGetUserList = async (req, res, next) => {
    try {
        let { page, page_length, order = 'DESC', searchTerm } = req.query;
        page = Number(page);
        page_length = Number(page_length);
        const limit = page_length ? page_length : undefined;
        const offset = (page && page_length) ? ((page - 1) * page_length) : undefined;
        const orderBy = [
            {
                column: 'users.created_at',
                order
            }
        ];
        const count = await models.User.query()
            .where('users.active', true)
            .count();
        const freeUserCount = await models.User.query()
            .where('users.active', true)
            .where(query => {
                query.whereExists(
                    models.User.relatedQuery('subscription')
                        .where('subscription.active', false)
                        .orWhere('subscription.valid_till', '<', moment().toISOString())
                )
                .orWhereNotExists(models.User.relatedQuery('subscription'))
            })
            .count();
        const query = UserClient.getList(limit, offset, orderBy);
        if (searchTerm) {
            query
                .where('phone_number', 'like', searchTerm)
                .orWhere('email', 'like', searchTerm)
        }
        const users = await query;
        const response = { total_items: Number(count[0].count), free_users: Number(freeUserCount[0].count), users };
        return res.json(apiFmt(response, 'SUCCESS'));
    } catch (e) {
        console.log('handleGetUserList --- ERROR', e);
        next(e);
    }
}

const handleGetUser = async (req, res, next) => {
    try {
        const { user_id: id } = req.params;
        const user = await UserClient.getUserQuery(id);
        return res.json(apiFmt(user, 'SUCCESS'));
    } catch (e) {
        console.log('handleGetUser --- ERROR', e);
        next(e);
    }
}

const handleRestrictUser = async (req, res, next) => {
    try {
        validateRequest(req);
        const { user_id: id } = req.params;
        const { is_restricted, restricted_for = '' } = req.body;
        const payload = { is_restricted, restricted_for };
        const user = await db.updateDoc('users', id, payload);
        return res.json(apiFmt(user, 'SUCCESS'));
    } catch (e) {
        console.log('handleRestrictUser', e);
        next(e);
    }
}

const handleDeleteUser = async (req, res, next) => {
    try {
        validateRequest(req);
        const { id } = req.body;
        const response = await UserClient.deleteUser(id);
        return res.json(apiFmt(response, 'SUCCESS'));        
    } catch (e) {
        console.log('handleDeleteUser --- ERROR', e);
        next(e);
    }
}

const handleAddSubscription = async (req, res, next) => {
    try {
        validateRequest(req);
        const {
            subscription_plan_id: subscriptionPlanId,
            user_id: userId,
            payment_transaction_id: transactionId,
        } = req.body;
        const user = await UserClient.addSubscription(userId, subscriptionPlanId, transactionId);
        return res.json(apiFmt(user, 'SUCCESS'));
    } catch (e) {
        console.log('handleAddSubscription --- ERROR', e);
        next(e);
    }
}

module.exports = {
    getUser,
    updateUser,
    validate,
    updateActive,
    subscribeWeb,
    unsubscribeWeb,
    subscribeMobile,
    unsubscribeMobile,
    getNotification,
    handleAddProfilePic,
    handleDeleteUser,
    handleLogout,
    handleSecurityPinAuth,
    updateNotification,
    deleteUser,
    updatePreferredLanguage,
    adminConfirmSignup,
    adminGetUsers,
    subscribe,
    unsubscribe,
    changePassword,
    setSecurityPin,
    // authenticatePusher,
    handleGetUser,
    handleGetUserSubscription,
    handleGetUserList,
    handleRestrictUser,
    handleAddSubscription,
}
