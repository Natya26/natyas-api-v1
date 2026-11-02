const { body, param, query, validationResult } = require('express-validator');
const APIError = require('../errors/APIError');
const _db = require('./../db');
const { apiFmt } = require("../services/fmt");
const models = require('./../db/models');
const UserClient = require('./../authentication/user');
const VideoClient = require('./../flowplayer-platform/video');
const ApplicationMetadata = require('./../settings/application-metadata');
const userClientInst = new UserClient();
const videoClientInst = new VideoClient();
const applicationMetadataClient = new ApplicationMetadata();

const handleAddOrRemoveFromMyList = async (req, res, next) => {
    try {
        validateReq(req);
        const payload = {
            'user_id': req.user.id,
            'series_id': req.body.series_id,
        };
        let result = '';
        switch (req.query.action) {
            case 'ADD':
                result = await userClientInst.addSeriesToMyList(payload);
                break;
            case 'REMOVE':
                result = await userClientInst.removeSeriesFromMyList(payload);
                break;
        
            default:
                throw new APIError(400, 'Invalid action');
        }
        if (result === 'SUCCESS') {
            const series = await videoClientInst.getSeries(req.user.id)
            .where({ 'series.id': req.body.series_id })
            .first();
            return res.json(apiFmt(series, 'Request Successful'));
        }
        else
            return res.json(apiFmt(undefined, 'Request Failed', true));        
    } catch (e) {
        console.log('handleAddOrRemoveFromMyList --- ERROR', e);
        next(e);
    }
}

const handleGetMyList = async (req, res, next) => {
    try {
        const platform = req.platform;
        const lang = await getLanguageCode(req.query.lang);
        const myList = await videoClientInst.getSeriesList()
            .where('series.active', true)
            .whereExists(
                models.Series.relatedQuery('inMyListOf')
                    .where('my_lists.user_id', req.user.id)
                    .where('my_lists.active', true)
                    .select(1)
            )
            .modify(query => {
                if (lang)
                    query.whereExists(
                        models.Series.relatedQuery('languages')
                            .where('language_series.active', true)
                            .where('languages.active', true)
                            .where('languages.code', lang)
                    );
                if (platform == 'WEB') {
                    query.where('is_published_for_web', true);
                } else if (platform == 'APP') {
                    query.where('is_published_for_app', true);
                }
            });
        return res.json(apiFmt(myList, 'My List'));
    } catch (e) {
        console.log('handleGetMyList --- ERROR', e);
        next(e);
    }
}

const handleAddOrRemoveFromLikedSeries = async (req, res, next) => {
    try {
        validateReq(req);
        const payload = {
            'user_id': req.user.id,
            'series_id': req.body.series_id,
        };
        let result = '';
        switch (req.query.action) {
            case 'ADD':
                result = await userClientInst.addToLikedSeries(payload);
                break;
            case 'REMOVE':
                result = await userClientInst.removeFromLikedSeries(payload);
                break;
        
            default:
                throw new APIError(400, 'Invalid action');
        }
        if (result === 'SUCCESS') {
            const series = await videoClientInst.getSeries(req.user.id)
            .where({ 'series.id': req.body.series_id })
            .first();
            return res.json(apiFmt(series, 'Request Successful'));
        }
        else
            return res.json(apiFmt(undefined, 'Request Failed', true));        
    } catch (e) {
        console.log('handleAddOrRemoveFromMyList --- ERROR', e);
        next(e);
    }
}

const handleGetLikedSeries = async (req, res, next) => {
    try {
        const platform = req.platform;
        const myList = await videoClientInst.getSeriesList()
            .where('series.active', true)
            .whereExists(
                models.Series.relatedQuery('likedBy')
                    .where('series_likes.user_id', req.user.id)
                    .where('series_likes.active', true)
                    .select(1)
            )
            .modify(query => {
                if (platform == 'WEB') {
                    query.where('is_published_for_web', true);
                } else if (platform == 'APP') {
                    query.where('is_published_for_app', true);
                }
            });
        return res.json(apiFmt(myList, 'Liked Series'));
    } catch (e) {
        console.log('handleGetLikedSeries --- ERROR', e);
        next(e);
    }
}

const handleGetComingSoon = async (req, res, next) => {
    try {
        validateReq(req);
        const platform = req.platform;
        const lang = await getLanguageCode(req.query.lang);
        const series = await videoClientInst.getSeriesList()
            .where('series.active', true)
            .where('series.coming_soon', true)
            .orderBy('series.created_at', 'DESC')
            .modify(query => {
                if (lang)
                    query.whereExists(
                        models.Series.relatedQuery('languages')
                            .where('language_series.active', true)
                            .where('languages.active', true)
                            .where('languages.code', lang)
                    );
                
                if (platform == 'WEB') {
                    query.where('is_published_for_web', true);
                } else if (platform == 'APP') {
                    query.where('is_published_for_app', true);
                }
            });
        return res.json(apiFmt(series, 'Coming Soon'));
    } catch (e) {
        next(e);
    }
}

const handleGetAppCurrentVersion = async (req, res, next) => {
    try {
        // const response = {
        //     packageName: 'com.world.navarasa',
        //     versionCode: 14,
        //     versionName: '1.1.13',
        //     isMandatory: true,
        // };
        const response = await applicationMetadataClient.getApplicationVersion(req.query);
        return res.json(apiFmt(response, 'APP_VERSION_INFO'));
    } catch (e) {
        console.log('handleGetAppCurrentVersion --- ERROR ', e);
        next(e);
    }
}

function validate(method) {
    switch (method) {
        case 'handleAddOrRemoveFromMyList': {
            return [
                query('action').exists().notEmpty().isIn(['ADD', 'REMOVE']),
                body('series_id').exists().notEmpty().isNumeric(),
            ];
        }
        case 'handleAddOrRemoveFromLikedSeries': {
            return [
                query('action').exists().notEmpty().isIn(['ADD', 'REMOVE']),
                body('series_id').exists().notEmpty().isNumeric(),
            ];
        }

        default: {
            return [];
        }
    }
}

function validateReq(req) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new APIError(400, "Invalid request", errors);
}

async function getLanguageCode(lang) {
    return new Promise(async (resolve, reject) => {
        try {
            let code = '';
            if (!lang) return resolve(code);
            const result = await _db.getQueryBuilder('languages')
                .select('code')
                .where('active', true)
                .where('name', 'ilike', lang)
                .first();
            if (result) code = result.code;
            return resolve(code)
        } catch (e) {
            return reject(e);
        }
    });
}

module.exports = {
    handleAddOrRemoveFromLikedSeries,
    handleAddOrRemoveFromMyList,
    handleGetAppCurrentVersion,
    handleGetComingSoon,
    handleGetLikedSeries,
    handleGetMyList,
    validate,
};