const { validationResult, body } = require('express-validator');
const APIError = require('../errors/APIError');
const passport = require('passport');
const db = require('../db');
const { OAuth2Client } = require('google-auth-library');
const { GOOGLE_OAUTH_CLIENT_ID } = process.env;
const gAuthClient = new OAuth2Client(GOOGLE_OAUTH_CLIENT_ID);
const UserClient = require('./user')
const userClient = new UserClient();
const jwtAuth = require('./jwt-auth');
const utils = require('../utils')
const moment = require('moment');
const { logFmt, apiFmt } = require('../services/fmt');
const s3Assets = require('./../s3/constants');
const { UserDetail } = require('otpless-node-js-auth-sdk');
var otplessClientId = process.env.OTPLESS_CLIENT_ID;
var otplessClientSecret = process.env.OTPLESS_CLIENT_SECRET;

async function signup(req, res, next) {
    try {
        validateRequest(req);
        const user = req.body;
        Object.keys(req.body).forEach(key => req.body[key] == null && delete req.body[key]);
        user['username'] = user.phone;
        if (!user['username']) throw new APIError(400, 'Please provide username!')
        user['photo'] = s3Assets.images.profilePicture.key;        
        const navarasaUser = await userClient.signUp(user)
        console.log(navarasaUser)
        const response = { message: "Signup Success", result: { navarasaUser } };
        res.json(apiFmt(response, "Signup Success"));
    } catch (e) {
        if (e.code === 'InvalidParameterException') {
            next(new APIError(400, e.message));
        } else {
            console.log(e);
            next(e);
        }
    }
}

async function verifyPhoneNumber(req, res, next) {
    try {
        validateRequest(req);
        const code = req.body.code;
        let lang = req.header('Accept-Language') || 'en';
        Object.keys(req.body).forEach(key => req.body[key] == null && delete req.body[key]);
        const username = req.body.phone;
        const phoneCode = req.body.phone_code;
        if (username) new APIError(400, 'Please provide username');
        const result = await userClient.verifyPhoneNumber(username, phoneCode, code, lang);
        const response = { message: 'Phone number verification success', result };
        if (req.body.password && result == 'SUCCESS') next();
        else res.json(apiFmt(response));
    } catch (e) {
        console.error(e);
        next(e);
    }
}

async function sendEmailVerification(req, res, next) {
    try {
        const accessToken = utils.parseAccessToken(req);
        // const result = await cognitoClient.sendVerification(accessToken, 'email');
        const response = { message: 'Verification email sent successfully', result: {} };
        res.json(apiFmt(response));
    } catch (e) {
        console.error(e);
        next(e);
    }
}

async function sendSmsVerification(req, res, next) {
    try {
        // const accessToken = utils.parseAccessToken(req);
        // const result = await cognitoClient.sendVerification(accessToken, 'phone_number');
        // const response = { message: 'Verification OTP sent successfully', result };
        res.json(apiFmt({}, 'This api depreciated.'));
    } catch (e) {
        console.error(e);
        // next(e);
    }
}

async function verifyEmail(req, res, next) {
    try {
        // validateRequest(req);
        // const accessToken = utils.parseAccessToken(req);
        // const { code } = req.body;
        // const result = await cognitoClient.verifyEmail(accessToken, code);
        // const cognitoUser = await cognitoClient.getUser(accessToken);
        // let emailVerfied = false;
        // cognitoUser.UserAttributes.forEach((attibute) => {
        //     if (attibute.Name === 'email_verified') {
        //         if (attibute.Value === 'true') emailVerfied = true;
        //     }
        // });
        res.json(apiFmt({ emailVerfied: true }, 'This api depreciated'));
    } catch (e) {
        // if (e.code === 'ExpiredCodeException' || e.code === 'CodeMismatchException') {
        //     next(new APIError(400, e.message));
        // }
        console.error(e);
        // next(e);
    }
}

async function login(req, res, next) {
    try {
        validateRequest(req);
        Object.keys(req.body).forEach(key => req.body[key] == null && delete req.body[key]);
        const {
            email = null,
            phone = null,
            phone_code = null,
            password,
            player_id = null,
        } = req.body;
        const username = phone || email;
        let userQuery = db.getQueryBuilder('users')
            .where({
                phone_number: username,
                phone_code
            })
            .orWhere({ authId: username })
            .first()
        let userCheck = await db.executeQuery(userQuery)
        if (!userCheck) {
            throw new APIError(400,'User not found.');
        }
        if (!username) throw new APIError(400, 'Please provide username!');
        let userBody = {};
        if (player_id) userBody.player_id = player_id;
        const loginResponse = await userClient.logIn(username, password, userBody, phone_code);
        res.json(apiFmt(loginResponse));
    } catch (e) {
        console.log(e);
        next(e);
    }
}

const verifyGoogleIdToken = async (idToken) => {
    return new Promise(async (resolve, reject) => {
        try {
            const ticket = await gAuthClient.verifyIdToken({
                idToken,
                audience: GOOGLE_OAUTH_CLIENT_ID,
            });
            const payload = ticket.getPayload();
            resolve(payload);
        } catch (e) {
            reject(e);
        }
    });
}

const signInWithGoogle = async (req) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response = undefined;
            const idToken = req.body.token;
            const userPayload = await verifyGoogleIdToken(idToken);
            const userExists = await userClient.getUser(userPayload.email);
            if (!userExists) {
                const userBody = {
                    email: userPayload.email,
                    email_verified: userPayload.email_verified,
                    first_name: userPayload.given_name,
                    last_name: userPayload.family_name,
                    authType: 'EMAIL',
                    type: 'SUBSCRIBER',
                    authId: userPayload.email,
                    active: false,
                    photo: s3Assets.images.profilePicture.key,
                };
                response = await userClient.signUpWithGoogle(userBody);
                return resolve(response);
            }
            let updateBody = {}
            if (req.body.player_id) updateBody.player_id = req.body.player_id;
            response = await userClient.glogin(userExists, updateBody);
            return resolve(response); 
        } catch (e) {
            return reject(e);
        }
    });
}

async function socialLogin(req, res, next) {
    try {
        validateRequest(req);
        let response = undefined;
        switch (req.body.type) {
            case 'GOOGLE':
                response = await signInWithGoogle(req);
                break;
            case 'FACEBOOK':
                break;
            default:
                throw new APIError(400, 'INVALID LOGIN TYPE');
        }
        return res.json(apiFmt(response, 'SUCCESS'));
    } catch (e) {
        next(e)
    }
}

function validateRequest(req) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new APIError(400, "Invalid request", errors);
    }
}

async function refreshTokens(req, res, next) {
    try {
        // validateRequest(req);
        const idToken = req.body.idToken;
        const refreshToken = req.body.refreshToken;
        let response = await refreshMethod(idToken, refreshToken)
        res.json(apiFmt(response));

    } catch (e) {
        next(e)
    }
}

async function forgotPassword(req, res, next) {
    try {
        let lang = req.header('Accept-Language') || 'en';
        Object.keys(req.body).forEach(key => req.body[key] == null && delete req.body[key]);
        const username = req.body.phone;
        const phoneCode = req.body.phone_code;
        if (!username) throw new APIError(400, 'Please provide username!')
        const response = await userClient.resendOTP(username, phoneCode, lang);
        res.json(apiFmt(response, lang == 'ar' ? 'تم إرسال رمز إعادة تعيين كلمة المرور.' : 'Password reset code sent.'));
    } catch (e) {
        next(e)
    }
}

async function resendOTP(req, res, next) {
    try {
        let lang = req.header('Accept-Language') || 'en';
        Object.keys(req.body).forEach(key => req.body[key] == null && delete req.body[key]);
        const username = req.body.phone;
        const phoneCode = req.body.phone_code;
        if (!username) throw new APIError(400, 'Please provide username!')
        const response = await userClient.resendOTP(username, phoneCode, lang);
        res.json(apiFmt(response, lang == 'ar' ? 'إعادة إرسال كلمة المرور لمرة واحدة.' : 'OTP resent.'));
    } catch (e) {
        next(e)
    }
}

async function forgotPasswordConfirm(req, res, next) {
    try {
        let lang = req.header('Accept-Language') || 'en';
        const { code, newPassword } = req.body;
        Object.keys(req.body).forEach(key => req.body[key] == null && delete req.body[key]);
        const username = req.body.phone;
        const phoneCode = req.body.phone_code;
        const response = await userClient.forgotPasswordConfirm(username, phoneCode, code, newPassword, lang);
        res.json(apiFmt(response, 'Password reset successfully.'));
    } catch (e) {
        next(e)
    }
}

async function validateToken(req, res, next) {
    try {
        const accessToken = req.body.accessToken;
        const idToken = req.body.idToken;
        const refreshToken = req.body.refreshToken;
        try {
            let user = await jwtAuth.verifyToken(accessToken, process.env.JWT_KEY);
            if (user) res.json(apiFmt(true, 'Valid Token'));
        } catch (e) {
            let response = await refreshMethod(idToken)
            res.json(apiFmt(response));
        }
    } catch (e) {
        next(e)
    }
}
const refreshMethod = async (idToken) => {
    try {
        const user = await jwtAuth.verifyToken(idToken, process.env.JWT_KEY);
        const username = user.phone_number;
        const phoneCode = user.phone_code;
        let authUser = await userClient.getUser(username, phoneCode)
        const response = userClient.loginResponse(user, authUser)
        return response
    } catch (e) {
        console.log(e);
        throw new APIError(400, e.message)
    }
}

async function appSignUp(req, res, next) {
    try {
        validateRequest(req);
        const user = req.body;
        Object.keys(req.body).forEach(key => req.body[key] == null && delete req.body[key]);
        user['username'] = user.phone;
        if (!user['username']) throw new APIError(400, 'Please provide username!')
        user['photo'] = process.env.PROFILE_PICTURE        
        const navarasaUser = await userClient.appSignUp(user)
        console.log(navarasaUser)
        const response = { message: "Signup Success", result: { navarasaUser } };
        res.json(apiFmt(response, "Signup Success"));
    } catch (e) {
        if (e.code === 'InvalidParameterException') {
            next(new APIError(400, e.message));
        } else {
            console.log(e);
            next(e);
        }
    }
}

async function loginWithOTP(req, res, next) {
    try {
        validateRequest(req);
        Object.keys(req.body).forEach(key => req.body[key] == null && delete req.body[key]);
        const { username, phone_code, type, player_id = null, otp = null } = req.body;
        let response = {};
        let message = undefined;
        switch (type) {
            case 'SEND_OTP':
                response = await userClient.sendLoginOTP(username, phone_code);
                message = 'Login OTP sent successfully';
                break;
            case 'VERIFY_OTP':
                let userBody = {};
                if (player_id) userBody.player_id = player_id;
                response = await userClient.loginWithOTP(username, phone_code, otp, userBody);
                message = 'OTP verified! Login successful';
                break;
        }
        res.json(apiFmt(response, message));
    } catch (e) {
        console.log(e);
        next(e);
    }
}

async function loginWithWhatsapp(req, res, next) {
    try {
        validateRequest(req);
        Object.keys(req.body).forEach(key => req.body[key] == null && delete req.body[key]);
        const { phone, phone_code, type} = req.body;
        let response = {};
        let message = undefined;
        console.log(phone,phone_code,type);
        switch (type) {
            case 'WHATSAPP':
                response = await userClient.sendMagicLink(phone, phone_code, type);
                console.log(response);
                message = 'in whatsapp login successfully';
                break;
        }
        res.json(apiFmt(response, message));
    } catch (e) {
        console.log(e);
        next(e);
    }
}
async function verifyOtplessToken (req,res, next) {
        const { token, phone, phone_code } = req.body;
        console.log(phone,phone_code);
        if (!token) {
            res.json({ status: 400, message: "No token provided" });
        }
        try {
            let response = {};
            let message = undefined;
            // Verify the token with provided credentials
            response = await userClient.verifyOtplessToken(token, phone, phone_code);
            message = 'Login Successfull';
            res.json(apiFmt(response, message));
        } catch (error) {
            console.error('Error:', error.message);
            next(error);
        }
}

function validate(method) {
    switch (method) {
        case 'appSignUp': {
            return [
                body('first_name', 'firstName is a required field').exists().isString(),
                body('phone', 'Please provide phone number').exists().isInt().exists(),
                body('email', 'Invalid email').isEmail().optional({ nullable: true }),
            ]
        }
        case 'loginWithOTP': {
            return [
                body('type', 'type is a required field').exists().not().isEmpty().isString().custom((value) => {
                    if (value && !['SEND_OTP', 'VERIFY_OTP'].includes(value)) {
                      throw new Error('Invalid type');
                    }
                    return true;
                }),
                body('username', 'username is a required field').exists().not().isEmpty(),
                body('otp').custom((value, { req }) => {
                    if (req.body.type && req.body.type === 'VERIFY_OTP' && !value) {
                      throw new Error('otp is a required field');
                    }
                    return true;
                }),
                body('phone_code', 'Login restricted to India only').exists().isIn(['+91']),
            ]
        }
        case 'loginWithWhatsapp': {
            return [
                body('type', 'type is a required field').exists().not().isEmpty().isString().custom((value) => {
                    if (value && !['WHATSAPP'].includes(value)) {
                      throw new Error('Invalid type');
                    }
                    return true;
                }),
                body('phone', 'phoneNumber is a required field').exists().not().isEmpty(),
                body('phone_code', 'Login restricted to India only').exists().isIn(['+91']),
            ]
        }
        case 'signup': {
            return [
                body('first_name', 'firstName is a required field').exists().isString(),
                body('last_name', 'lastName is a required field').exists().isString(),
                body('phone', 'Please provide phone number').exists().isInt().exists(),
                body('phone_code', 'Please provide phone code').exists().isInt().exists(),
                body('email', 'Invalid email').isEmail().optional({ nullable: true }),
                body('photo').optional({ nullable: true }).isString(),
                body('password', 'password is a required field').exists().isString(),
            ]
        }
        case 'login': {
            return [
                body('email', 'Invalid Email').optional({ nullable: true }).isEmail(),
                body('phone', 'Invalid Phone').optional({ nullable: true }).isInt(),
                body('phone_code', 'Invalid Phone Code').optional({ nullable: true }).isInt(),
                body('password', 'password is a required field').exists().isString()
            ]
        }
        case 'verify_email': {
            return [
                body('code', "Invalid Code").exists()

            ]
        }
        case 'social': {
            return [
                body('token', "Invalid token").exists(),
                body('type', "type is a required field").exists()
            ]
        }
        case 'verify_phone': {
            return [
                body('code', "Invalid code").exists(),
                body('phone', 'Invalid Phone Number').exists().isInt()
            ]
        }
        case 'refresh': {
            return [
                body('idToken', 'Invalid idToken').exists().isString(),
                body('refreshToken', 'refreshToken is a required field').exists().isString()
            ]
        }
        case 'forgot_password': {
            return [
                body('phone', 'Invalid Phone').optional({ nullable: true }).isInt(),
                body('email', 'Invalid Email').optional({ nullable: true }).isEmail(),
            ]
        }
        case 'forgot_password_confirm': {
            return [
                body('phone', 'Invalid Phone').optional({ nullable: true }).isInt(),
                body('email', 'Invalid Email').optional({ nullable: true }).isEmail(),
                body('code', 'Invalid Code').exists().isString(),
            ]
        }
        case 'validate_token': {
            return [
                body('accessToken', 'Invalid Access Token').exists(),
                body('refreshToken', 'Invalid Refresh Token').exists(),
                body('idToken', 'Invalid ID Token').exists()
            ]
        }
        default: {
            return [];
        }
    }
}

module.exports = {
    appSignUp,
    validate,
    signup,
    login,
    loginWithOTP,
    verifyPhoneNumber,
    sendEmailVerification,
    sendSmsVerification,
    resendOTP,
    verifyEmail,
    socialLogin,
    refreshTokens,
    forgotPassword,
    forgotPasswordConfirm,
    validateToken,
    loginWithWhatsapp,
    verifyOtplessToken,
}
