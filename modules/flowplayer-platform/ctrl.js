const { validationResult, body, param, query } = require('express-validator');
const APIError = require('../errors/APIError');
const { apiFmt } = require("../services/fmt");
const db = require('../db');
const Flowplayer = require('./flowplayer');
const { uploadImage, getFile } = require('../s3');
const Video = require('./video');
const flowplayerInst = new Flowplayer();
const videoInst = new Video();
const moment = require('moment');
const models = require('../db/models');
const { raw } = require('objection');
const { EventEmitter } = require('./../events/event');
const { ROLES } = require('./../authentication/middleware');
const SubscriptionClient = require('./../subscriptions/subscription');

const handleListCategory = async (req, res, next) => {
    try {
        return res.json(apiFmt(undefined, 'API Deprecated.'));
        Object.keys(req.query).forEach(key => !req.query[key] && delete req.query[key]);
        response = await flowplayerInst.listCategory(req.query);
        res.json(apiFmt(response, 'Category List'));
    } catch (e) {
        console.log(e);
        next(e);
    }
}

const handleCreateCategory = async (req, res, next) => {
    try {
        return res.json(apiFmt(undefined, 'API Deprecated.'));
        response = await flowplayerInst.createCategory(req.body);
        res.json(apiFmt(response, 'Category Created'));
    } catch (e) {
        console.log(e);
        next(e);
    }
}

const handleGetCategory = async (req, res, next) => {
    try {
        return res.json(apiFmt(undefined, 'API Deprecated.'));
        response = await flowplayerInst.getCategory(req.params.category_id);
        res.json(apiFmt(response, 'Category Data'));
    } catch (e) {
        console.log(e);
        next(e);
    }
}

const handleUpdateCategory = async (req, res, next) => {
    try {
        return res.json(apiFmt(undefined, 'API Deprecated.'));
        response = await flowplayerInst.updateCategory(req.params.category_id, req.body);
        res.json(apiFmt(response, 'Category Updated'));
    } catch (e) {
        console.log(e);
        next(e);
    }
}

const handleDeleteCategory = async (req, res, next) => {
    try {
        return res.json(apiFmt(undefined, 'API Deprecated.'));
        response = await flowplayerInst.deleteCategory(req.params.category_id);
        res.json(apiFmt(response, 'Category Deleted'));
    } catch (e) {
        console.log(e);
        next(e);
    }
}

const handleListLiveSource = async (req, res, next) => {
    try {
        return res.json(apiFmt(undefined, 'API Deprecated.'));
        Object.keys(req.query).forEach(key => (!req.query[key] && delete req.query[key]));
        response = await flowplayerInst.listLiveSource(req.query);
        res.json(apiFmt(response, 'Live Source List'));
    } catch (e) {
        console.log(e);
        next(e);
    }
}

const handleCreateLiveSource = async (req, res, next) => {
    try {
        return res.json(apiFmt(undefined, 'API Deprecated.'));
        response = await flowplayerInst.createLiveSource(req.body);
        res.json(apiFmt(response, 'Live Source Created'));
    } catch (e) {
        console.log(e);
        next(e);
    }
}

const handleGetLiveSource = async (req, res, next) => {
    try {
        return res.json(apiFmt(undefined, 'API Deprecated.'));
        response = await flowplayerInst.getLiveSource(req.params.livesource_id);
        res.json(apiFmt(response, 'Live Source Data'));
    } catch (e) {
        console.log(e);
        next(e);
    }
}

const handleUpdateLiveSource = async (req, res, next) => {
    try {
        return res.json(apiFmt(undefined, 'API Deprecated.'));
        response = await flowplayerInst.updateLiveSource(req.params.livesource_id, req.body);
        res.json(apiFmt(response, 'Live Source Updated'));
    } catch (e) {
        console.log(e);
        next(e);
    }
}

const handleDeleteLiveSource = async (req, res, next) => {
    try {
        return res.json(apiFmt(undefined, 'API Deprecated.'));
        response = await flowplayerInst.deleteLiveSource(req.params.livesource_id);
        res.json(apiFmt(response, 'Live Source Updated'));
    } catch (e) {
        console.log(e);
        next(e);
    }
}

const handleListLivestream = async (req, res, next) => {
    try {
        return res.json(apiFmt(undefined, 'API Deprecated.'));
        Object.keys(req.query).forEach(key => (!req.query[key] && delete req.query[key]));
        response = await flowplayerInst.listLivestream(req.query);
        res.json(apiFmt(response, 'Livestream List'));
    } catch (e) {
        console.log(e);
        next(e);
    }
}

const handleCreateLivestream = async (req, res, next) => {
    try {
        return res.json(apiFmt(undefined, 'API Deprecated.'));
        response = await flowplayerInst.createLivestream(req.body);
        res.json(apiFmt(response, 'Livestream Created'));
    } catch (e) {
        console.log(e);
        next(e);
    }
}

const handleGetLivestream = async (req, res, next) => {
    try {
        return res.json(apiFmt(undefined, 'API Deprecated.'));
        response = await flowplayerInst.getLivestream(req.params.livestreams_id);
        res.json(apiFmt(response, 'Livestream Data'));
    } catch (e) {
        console.log(e);
        next(e);
    }
}

const handleUpdateLivestream = async (req, res, next) => {
    try {
        return res.json(apiFmt(undefined, 'API Deprecated.'));
        response = await flowplayerInst.updateLivestream(req.params.livestreams_id, req.body);
        res.json(apiFmt(response, 'Livestream Updated'));
    } catch (e) {
        console.log(e);
        next(e);
    }
}

const handleDeleteLivestream = async (req, res, next) => {
    try {
        return res.json(apiFmt(undefined, 'API Deprecated.'));
        response = await flowplayerInst.deleteLivestream(req.params.livestreams_id);
        res.json(apiFmt(response, 'Livestream Deleted'));
    } catch (e) {
        console.log(e);
        next(e);
    }
}

const handleCreateOrUpdateLiveOverlay = async (req, res, next) => {
    try {
        return res.json(apiFmt(undefined, 'API Deprecated.'));
        response = await flowplayerInst.createOrUpdateLiveOverlay(
            req.params.livestreams_id,
            req.params.template_id,
            req.get('idempotency-key'),
            req.body
        );
        res.json(apiFmt(response, 'Create/Update Liveoverlay Successful'));
    } catch (e) {
        console.log(e);
        next(e);
    }
}

const handleDeleteLiveOverlay = async (req, res, next) => {
    try {
        return res.json(apiFmt(undefined, 'API Deprecated.'));
        response = await flowplayerInst.deleteLiveOverlay(req.params.overlay_id, req.params.template_id);
        res.json(apiFmt(response, 'Liveoverlay Deleted'));
    } catch (e) {
        console.log(e);
        next(e);
    }
}

const handleListVideo = async (req, res, next) => {
    try {
        return res.json(apiFmt(undefined, 'API Deprecated.'));
        Object.keys(req.query).forEach(key => (!req.query[key] && delete req.query[key]));
        response = await flowplayerInst.listVideo(req.query);
        res.json(apiFmt(response, 'Video List'));
    } catch (e) {
        console.log(e);
        next(e);
    }
}

const handleCreateVideo = async (req, res, next) => {
    try {
        return res.json(apiFmt(undefined, 'API Deprecated.'));
        response = await flowplayerInst.createVideo(req.body);
        res.json(apiFmt(response, 'Video Created'));
    } catch (e) {
        console.log(e);
        next(e);
    }
}

const handleGetVideo = async (req, res, next) => {
    try {
        const user = req.user;
        if (user.user_type === ROLES.SUBSCRIBER) {
            const subscription = await SubscriptionClient.getSubscription()
                .where('subscriptions.user_id', user.id);
            if (!subscription || (subscription && !subscription.active)) throw new APIError(401, 'NO_SUBSCRIPTION');
            const now = moment().toISOString();
            if (moment(now).diff(subscription.valid_till, 'milliseconds') > 0) throw new APIError(401, 'SUBSCRIPTION_EXPIRED');
        }
        const videoId = req.params.video_id;
        const metadata = await Video.getVideo().where({
            'videos.fwp_id': videoId,
            'videos.active': true
        }).first();
        // const video = await flowplayerInst.getVideo(videoId);
        // res.json(apiFmt({ metadata, video }, 'Video Data'));
        res.json(apiFmt({ metadata }, 'Video Data'));
    } catch (e) {
        console.log(e);
        next(e);
    }
}

const handleUpdateVideo = async (req, res, next) => {
    try {
        let updateVidPayload = {};
        updateVidPayload['video'] = {
            name: req.body.name,
            description: req.body.description,
            duration: req.body.duration,
            poster: req.body.poster,
            language_id: req.body.language_id
        };
        updateVidPayload['category'] = req.body['categories'];
        updateVidPayload['genre'] = req.body['genres'];
        updateVidPayload['encodings'] = req.body['encodings'];
        delete req.body['categories'];
        delete req.body['genres'];
        // const video = await flowplayerInst.updateVideo(req.params.video_id, req.body);
        const updatedVid = await videoInst.handleUpdateVideo(req.params.video_id, updateVidPayload);
        res.json(apiFmt({ metadata: updatedVid }, 'Video Updated'));
    } catch (e) {
        console.log(e);
        next(e);
    }
}

const handleDeleteVideo = async (req, res, next) => {
    try {
        const video = await videoInst.handleDeleteVideo(req.params.video_id);
        // response = await flowplayerInst.deleteVideo(req.params.video_id);
        res.json(apiFmt({ requestStatus: response, video }, 'Video Deleted'));
    } catch (e) {
        console.log(e);
        next(e);
    }
}

const handleGetSignedURL = async (req, res, next) => {
    try {
        return res.json(apiFmt(undefined, 'API Deprecated.'));
        response = await flowplayerInst.getSignedURL(req.body);
        res.json(apiFmt(response, 'Request Successful'));
    } catch (e) {
        console.log(e);
        next(e);
    }
}

const handleCompleteSignedUpload = async (req, res, next) => {
    try {
        return res.json(apiFmt(undefined, 'API Deprecated.'));
        response = await flowplayerInst.completeSignedUpload(req.body);
        res.json(apiFmt(response, 'Request Successful'));
    } catch (e) {
        console.log(e);
        next(e);
    }
}

const handleListPlaylist = async (req, res, next) => {
    try {
        return res.json(apiFmt(undefined, 'API Deprecated.'));
        Object.keys(req.query).forEach(key => (!req.query[key] && delete req.query[key]));
        response = await flowplayerInst.listPlaylist(req.query);
        res.json(apiFmt(response, 'List of Playlists'));
    } catch (e) {
        console.log(e);
        next(e);
    }
}

const handleCreatePlaylist = async (req, res, next) => {
    try {
        return res.json(apiFmt(undefined, 'API Deprecated.'));
        response = await flowplayerInst.createPlaylist(req.body);
        res.json(apiFmt(response, 'Playlist Created'));
    } catch (e) {
        console.log(e);
        next(e);
    }
}

const handleGetPlaylist = async (req, res, next) => {
    try {
        return res.json(apiFmt(undefined, 'API Deprecated.'));
        response = await flowplayerInst.getPlaylist(req.params.playlist_id);
        res.json(apiFmt(response, 'Playlist Data'));
    } catch (e) {
        console.log(e);
        next(e);
    }
}

const handleUpdatePlaylist = async (req, res, next) => {
    try {
        return res.json(apiFmt(undefined, 'API Deprecated.'));
        response = await flowplayerInst.updatePlaylist(req.params.playlist_id, req.body);
        res.json(apiFmt(response, 'Playlist Updated'));
    } catch (e) {
        console.log(e);
        next(e);
    }
}

const handleDeletePlaylist = async (req, res, next) => {
    try {
        return res.json(apiFmt(undefined, 'API Deprecated.'));
        response = await flowplayerInst.deletePlaylist(req.params.playlist_id);
        res.json(apiFmt(response, 'Playlist Deleted'));
    } catch (e) {
        console.log(e);
        next(e);
    }
}

const handleCreateTranscription = async (req, res, next) => {
    try {
        return res.json(apiFmt(undefined, 'API Deprecated.'));
        Object.keys(req.body).forEach(key => (!req.body[key] && delete req.body[key]));
        response = await flowplayerInst.createTranscription(req.params.video_id, req.body);
        res.json(apiFmt(response, 'Request Successful'));
    } catch (e) {
        console.log(e);
        next(e);
    }
}

const handleGetSeries = async (req, res, next) => {
    try {
        const series = await videoInst.getSeries(req.user.id)
            .where({
                'series.id': req.params.series_id,
                'series.active': true
            }).first();
        return res.json(apiFmt(series, 'SUCCESS'));
    } catch (e) {
        console.log(e);
        next(e)
    }
}

const handleGetSeriesList = async (req, res, next) => {
    try {
        let { page, page_length, order = 'ASC' } = req.query;
        page = Number(page);
        page_length = Number(page_length);
        const limit = page_length ? page_length : undefined;
        const offset = (page && page_length) ? ((page - 1) * page_length) : undefined;
        const orderBy = [
            {
                column: 'series.created_at',
                order
            }
        ];
        const series = await videoInst.getSeriesList(limit, offset, orderBy)
            .where('series.active', true);
        return res.json(apiFmt(series, 'SUCCESS'));
    } catch (e) {
        console.log(e);
        next(e)
    }
}

const handleCreateSeries = async (req, res, next) => {
    try {
        validateRequest(req);
        const { genres = [], languages = [], ...payload } = req.body;
        const series = await videoInst.createSeries(payload);
        await videoInst.addOrRemoveSeriesGenre(series.id, genres);
        await videoInst.addOrRemoveSeriesLanguage(series.id, languages);
        const response = await videoInst.getSeries(req.user.id)
            .where({ 'series.id': series.id })
            .first();
        EventEmitter.emit('NEW_SERIES', { type: 'NEW_SERIES', series: response });
        return res.json(apiFmt(response, 'SUCCESS'));
    } catch (e) {
        console.log(e);
        next(e)
    }
}

const handleUpdateSeries = async (req, res, next) => {
    try {
        validateRequest(req);
        const { genres = [], languages = [], ...payload } = req.body;
        const seriesId = req.params.series_id;
        const series = await videoInst.updateSeries(seriesId, payload);
        await videoInst.addOrRemoveSeriesGenre(seriesId, genres);
        await videoInst.addOrRemoveSeriesLanguage(seriesId, languages);
        const response = await videoInst.getSeries(req.user.id)
            .where({ 'series.id': series.id })
            .first();
        return res.json(apiFmt(response, 'SUCCESS'));
    } catch (e) {
        console.log(e);
        next(e)
    }
}

const handleUpdateOrCreateSeason = async (req, res, next) => {
    try {
        validateRequest(req);
        let { series_id, season_id = null } = req.params;
        const { name, description = '', season_number } = req.body;
        const payload = { name, description, series_id, season_number };
        await videoInst.updateOrCreateSeason(season_id, payload);
        const response = await videoInst.getSeries(req.user.id)
            .where({ 'series.id': series_id })
            .first();
        return res.json(apiFmt(response, 'SUCCESS'));
    } catch (e) {
        console.log(e);
        next(e)
    }
}

const handleAddOrRemoveEpisodes = async (req, res, next) => {
    try {
        validateRequest(req);
        let { series_id, season_id } = req.params;
        const { episodes = [] } = req.body;
        const result = await videoInst.addOrRemoveSeasonEpisode({ seriesId: series_id, seasonId: season_id }, episodes);
        const response = await videoInst.getSeries(req.user.id)
            .where({ 'series.id': series_id })
            .first();
        if (result != 'REMOVED') EventEmitter.emit('NEW_EPISODES', { type: 'NEW_EPISODES', series: response });
        return res.json(apiFmt(response, 'SUCCESS'));
    } catch (e) {
        console.log(e);
        next(e)
    }
}

const handleDeleteSeries = async (req, res, next) => {
    try {
        validateRequest(req);
        const response = await videoInst.deleteSeries(req.params.series_id);
        return res.json(apiFmt(response, 'SUCCESS'));
    } catch (e) {
        console.log(e);
        next(e)
    }
}

const handleDeleteSeason = async (req, res, next) => {
    try {
        validateRequest(req);
        const response = await videoInst.deleteSeason(req.params.series_id, req.params.season_id);
        return res.json(apiFmt(response, 'SUCCESS'));
    } catch (e) {
        console.log(e);
        next(e)
    }
}

const handleUploadSeriesPoster = async (req, res, next) => {
    try {
        validateRequest(req);
        let payload = {};
        const seriesId = req.params.series_id;
        switch (req.body.type) {
            case 'ADD':
                if (!req.file) throw new APIError(400, 'File is required');
                const file = req.file;
                file.s3Key = `series/${seriesId}/poster/${file.filename}`;
                const key = await uploadImage(file);
                payload = { poster: key };
                break;
            case 'REMOVE':
                payload = { poster: '' };
                break;
        }
        const series = await videoInst.updateSeries(seriesId, payload);
        const response = await videoInst.getSeries(req.user.id)
            .where({ 'series.id': series.id });
        return res.json(apiFmt(response, 'SUCCESS'));
    } catch (e) {
        console.log(e);
        next(e)
    }
}

const handleGetSeriesPoster = async (req, res, next) => {
    try {
        validateRequest(req);
        const series = await db.getQueryBuilder('series')
            .where({ id: req.params.series_id })
            .first();
        if (!series) throw new APIError(404, 'Invalid Series ID');
        const s3Key = series.poster;
        const data = await getFile(s3Key);
        res.set({
            'Content-Type': 'image/png',
            'Content-Length': data.ContentLength
        });
        res.send(data.Body);
    } catch (e) {
        console.log(e);
        next(e)
    }
}

const handleGetVideoList = async (req, res, next) => {
    try {
        validateRequest(req);
        const qParams = Object.keys(req.query);
        let page, pageLength, offset;
        if (qParams.includes('page'))
            page = req.query.page
        if (qParams.includes('page_length') && page) {
            pageLength = req.query.page_length
            offset = (page - 1) * pageLength;
        }
        const orderBy = [
            {
                column: 'videos.created_at',
                order: 'DESC'
            }
        ];
        const total = await models.Video.query()
            .where('videos.active', true)
            .whereExists(
                models.Video.relatedQuery('category')
                    .where('category_videos.active', true)
                    .where('category.name', 'SERIES')
            )
            .whereNotExists(
                models.Video.relatedQuery('series')
                    .where('series.active', true)
            )
            .count();
        const videos = await Video.getVideoList(pageLength, offset, orderBy)
            .where('videos.active', true)
            .whereExists(
                models.Video.relatedQuery('category')
                    .where('category_videos.active', true)
                    .where('category.name', 'SERIES')
            )
            .whereNotExists(
                models.Video.relatedQuery('series')
                    .where('series.active', true)
            );
        const response = {
            total_items: Number(total[0].count),
            videos,
        };
        res.json(apiFmt(response, 'SUCCESS'));
    } catch (e) {
        console.log(e);
        next(e)
    }
}

const handleListAllVideo = async (req, res, next) => {
    try {
        const qParams = Object.keys(req.query);
        let page, pageLength, offset, order = 'DESC';
        if (qParams.includes('page'))
            page = req.query.page
        if (qParams.includes('page_length') && page) {
            pageLength = req.query.page_length
            offset = (page - 1) * pageLength;
        }
        if (qParams.includes('order') && req.query.order)
            order = req.query.order;
        const orderBy = [
            {
                column: 'videos.created_at',
                order
            }
        ];
        const response = await Video.getVideoList(pageLength, offset, orderBy)
            .where('videos.active', true);
        res.json(apiFmt(response, 'SUCCESS'));
    } catch (e) {
        console.log(e);
        next(e)
    }
}

const seriesHSQBuilder = (itemId, withComingSoon = false, order = '', lang = '', userId = '', platform = 'WEB') => {
    try {
        const columns = ['series.*'];
        if (userId) {
            columns.push(
                raw('(? > 0) AS "isInMyList"', models.Series.relatedQuery('inMyListOf')
                    .where('my_lists.user_id', userId)
                    .where('my_lists.active', true)
                    .count()
                )
            );
            columns.push(
                raw('(? > 0) AS "isLiked"', models.Series.relatedQuery('likedBy')
                    .where('series_likes.user_id', userId)
                    .where('series_likes.active', true)
                    .count()
                )
            );
        }
        return models.Series.query()
            .column(columns)
            .select(
                raw('? as "itemId"', [itemId]),
                // 'series.*',
                models.Series.relatedQuery('seasons')
                .select(raw('COUNT(DISTINCT(seasons.id))::INTEGER'))
                .where('seasons.active', true)
                .as('season_count'),
                models.Series.relatedQuery('episodes')
                .select(raw('COUNT(DISTINCT(episodes.id))::INTEGER'))
                .where('episodes.active', true)
                .as('episode_count'),
            )
            .withGraphFetched('[genres, languages, images]')
            .modifyGraph('genres', query => {
                query.where('genre_series.active', true)
                    .where('genres.active', true)
                    .select('genres.id', 'genres.name')
            })
            .modifyGraph('languages', query => {
                query.where('language_series.active', true)
                    .where('languages.active', true)
                    .select('languages.id', 'languages.name')
            })
            .modifyGraph('images', query => {
                query
                    .where('series_images.active', true)
            })
            .where('series.active', true)
            .modify(query => {
                if (!withComingSoon)
                    query.where('series.coming_soon', false);
                if (lang)
                    query.whereExists(
                        models.Series.relatedQuery('languages')
                            .where('language_series.active', true)
                            .where('languages.active', true)
                            .where('languages.code', lang)
                    )
                if (order)
                    query.orderBy('series.created_at', order)
                
                if (platform == 'WEB') {
                    query.where('is_published_for_web', true);
                } else if (platform == 'APP') {
                    query.where('is_published_for_app', true);
                }
            });
        } catch (e) {
        throw e;
    }
}

const ORDER = Object.freeze({
    ASC: 'ASC',
    DESC: 'DESC',
});

const BOOL = Object.freeze({
    TRUE: true,
    FALSE: false,
});

const languages = Object.freeze({
    malayalam: 'ml',
    tamil: 'ta',
    hindi: 'hi',
});

const handleGetHomeScreenData = async (req, res, next) => {
    try {
        // validateRequest(req);
        const platform = req.platform;
        let lang = req.query.lang ? req.query.lang.toLowerCase() : '';
        const items = {
            featured: {
                id: 'i01',
                name: 'featured'
            },
            continueWatching: {
                id: 'i02',
                name: 'continueWatching'
            },
            recommended: {
                id: 'i03',
                name: 'recommended'
            },
            trailers: {
                id: 'i04',
                name: 'trailers'
            },
            latestSeries: {
                id: 'i05',
                name: 'latestSeries'
            },
            allSeries: {
                id: 'i06',
                name: 'allSeries'
            },
            malayalam: {
                id: 'i07',
                name: 'malayalam'
            },
            tamil: {
                id: 'i08',
                name: 'tamil'
            },
            hindi: {
                id: 'i09',
                name: 'hindi'
            },
            telugu: {
                id: 'i10',
                name: 'telugu'
            },
            kannada: {
                id: 'i11',
                name: 'kannada'
            },
        };
        const featured = await seriesHSQBuilder(
                items['featured'].id,
                undefined,
                undefined,
                undefined,
                req.user.id,
                platform
                )
            .where('series.featured', BOOL.TRUE)
            .withGraphFetched('[trailers, seasons.[episodes]]')
            .modifyGraph('trailers', query => {
                query.where('series_trailers.active', BOOL.TRUE)
                    .where('videos.active', BOOL.TRUE)
            })
            .modifyGraph('seasons', query => query.where('seasons.active', BOOL.TRUE))
            .modifyGraph('seasons.episodes', query => query.where('videos.active', BOOL.TRUE))
            .first();
        const latestSeries = await seriesHSQBuilder(items['latestSeries'].id, BOOL.FALSE, ORDER.DESC, lang ? languages[lang] : '', undefined, platform).limit(10);
        const allSeries = await seriesHSQBuilder(items['allSeries'].id, BOOL.FALSE, ORDER.DESC, lang ? languages[lang] : '', undefined, platform);
        const continueWatching = await seriesHSQBuilder(items['continueWatching'].id, BOOL.FALSE, ORDER.DESC, lang ? languages[lang] : '', undefined, platform).limit(10);
        const recommended = await seriesHSQBuilder(items['recommended'].id, BOOL.FALSE, ORDER.DESC, lang ? languages[lang] : '', undefined, platform).limit(10);
        const malayalam = (lang && lang != 'malayalam') ? [] : await seriesHSQBuilder(items['malayalam'].id, BOOL.FALSE, ORDER.DESC, languages.malayalam, undefined, platform);
        const tamil = (lang && lang != 'tamil') ? [] : await seriesHSQBuilder(items['tamil'].id, BOOL.FALSE, ORDER.DESC, languages.tamil, undefined, platform);
        const hindi = (lang && lang != 'hindi') ? [] : await seriesHSQBuilder(items['hindi'].id, BOOL.FALSE, ORDER.DESC, languages.hindi, undefined, platform);
        const telugu = []; //await seriesHSQBuilder(items['telugu'].id, BOOL.FALSE, ORDER.DESC, 'te');
        const kannada = []; //await seriesHSQBuilder(items['kannada'].id, BOOL.FALSE, ORDER.DESC, 'kn');
        const trailers = await models.Video.query()
            .whereExists(
                models.Video.relatedQuery('category')
                    .where('category_videos.active', true)
                    .where('category.active', true)
                    .where('category.name', 'TRAILERS')
            )
            .withGraphFetched('[category, genres, images]')
            .modifyGraph('category', query => query.select('categories.id', 'categories.name'))
            .modifyGraph('genres', query => query.select('genres.id', 'genres.name').where('genres.active', true))
            .modifyGraph('images', query => query.where('video_images.active', true))
            .where('videos.active', true)
            .orderBy('videos.created_at', 'DESC')
            .modify(query => {
                if (lang) {
                    query.whereExists(
                        models.Video.relatedQuery('language')
                            .where('language.active', true)
                            .where('language.code', languages[lang])
                    )
                }
                console.log(platform)
                if (platform == 'WEB') {
                    query.where('is_published_for_web', true);
                } else if (platform == 'APP') {
                    query.where('is_published_for_app', true);
                }
            })
            .select(
                raw('? as "itemId"', [items['trailers'].id]),
                'videos.id',
                'videos.fwp_id',
                'videos.name',
                'videos.description',
                'videos.poster',
                'videos.duration',
                'videos.active',
                'videos.created_at',
                'videos.updated_at'
            );
        const response = {
            items: Object.values(items),
            featured,
            continueWatching,
            recommended,
            trailers,
            latestSeries,
            allSeries,
            malayalam,
            tamil,
            hindi,
            telugu,
            kannada,
        }
        res.json(apiFmt(response, 'SUCCESS'));
    } catch (e) {
        console.log(e);
        next(e)
    }
}

const handleUploadVideoPoster = async (req, res, next) => {
    try {
        validateRequest(req);
        let payload = {};
        const videoId = req.params.video_id;
        switch (req.body.type) {
            case 'ADD':
                if (!req.file) throw new APIError(400, 'File is required');
                const file = req.file;
                file.s3Key = `videos/${videoId}/poster/${file.filename}`;
                const key = await uploadImage(file);
                payload = { poster: key };
                break;
            case 'REMOVE':
                payload = { poster: '' }
                break;
        }
        const video = await Video.updateVideo(payload, { 'fwp_id': videoId });
        const response = await Video.getVideo().where({ 'videos.id': video.id }).first();
        return res.json(apiFmt(response, 'SUCCESS'));
    } catch (e) {
        console.log(e);
        next(e)
    }
}

const handleGetVideoPoster = async (req, res, next) => {
    try {
        validateRequest(req);
        const videos = await db.getQueryBuilder('videos')
            .where({ fwp_id: req.params.video_id })
            .first();
        if (!videos) throw new APIError(404, 'Invalid Video ID');
        const s3Key = videos.poster;
        const data = await getFile(s3Key);
        res.set({
            'Content-Type': 'image/png',
            'Content-Length': data.ContentLength
        });
        res.send(data.Body);
    } catch (e) {
        console.log(e);
        next(e)
    }
}

const handleMediaSearch = async (req, res, next) => {
    try {
        validateRequest(req);
        const platform = req.platform;
        const items = {
            series: {
                id: 'i01',
                name: 'series'
            }
        };
        const searchTerm = req.params.search_term;
        const series = await seriesHSQBuilder(items['series'].id, true)
            .modify(query => {
                if (searchTerm)
                    query.where('series.name', 'ilike', `%${searchTerm}%`)
                        .orWhereExists(
                            models.Series.relatedQuery('genres')
                                .where('genres.name', 'ilike', `%${searchTerm}%`)
                                .where('genres.active', true)
                        );
                
                if (platform == 'WEB') {
                    query.where('is_published_for_web', true);
                } else if (platform == 'APP') {
                    query.where('is_published_for_app', true);
                }
            });
        res.json(apiFmt({ items: Object.values(items), series }, 'SUCCESS'));
    } catch (e) {
        console.log(e);
        next(e)
    }
}

const handleGetNewNHotData = async (req, res, next) => {
    try {
        validateRequest(req);
        const platform = req.platform;
        let lang = req.query.lang ? req.query.lang.toLowerCase() : '';
        const items = {
            series: {
                id: 'i01',
                name: 'series'
            }
        };
        const dateUl = moment().toISOString();
        const dateLl = moment().subtract({ day: 30 }).toISOString();
        const series = await seriesHSQBuilder(items['series'].id, BOOL.FALSE, ORDER.DESC, lang ? languages[lang] : '', undefined, platform)
            .whereBetween('series.created_at', [dateLl, dateUl]);
        res.json(apiFmt({ items: Object.values(items), series }, 'SUCCESS'));
    } catch (e) {
        console.log(e);
        next(e)
    }
}

const handleGetLookupData = async (req, res, next) => {
    try {
        validateRequest(req);
        let response = {};
        const requestedData = req.query.name.split(',');
        if (requestedData.includes('languages'))
            response.languages = await models.Language.query()
                .where('languages.active', true)
                .orderBy('languages.id', 'ASC')
                .select('languages.id', 'languages.code', 'languages.name');
        if (requestedData.includes('categories'))
            response.categories = await models.Category.query()
                .where('categories.active', true)
                .orderBy('categories.id', 'ASC')
                .select('categories.id', 'categories.name');
        if (requestedData.includes('genres'))
            response.genres = await models.Genre.query()
                .where('genres.active', true)
                .orderBy('genres.id', 'ASC')
                .select('genres.id', 'genres.name');
        if (requestedData.includes('trailers'))
            response.trailers = await models.Video.query()
                .whereNotExists(
                    models.Video.relatedQuery('seriesTrailer')
                        .where('seriesTrailer.active', true)
                )
                .whereExists(
                    models.Video.relatedQuery('category')
                        .where({
                            'category_videos.active': true,
                            'category.active': true,
                            'category.name': 'TRAILERS',
                        })
                )
                .where('videos.active', true)
                .select(
                    'videos.id',
                    'videos.fwp_id',
                    'videos.name',
                    'videos.description',
                    'videos.poster',
                    'videos.duration',
                    'videos.active',
                    'videos.created_at',
                    'videos.updated_at'
                )
                .orderBy('videos.created_at', 'DESC');

        console.log(response.trailers?.length)
        return res.json(apiFmt(response, 'Videos Lookup Data'));
    } catch (e) {
        next(e);
    }
}

const handleAddOrRemoveTrailers = async (req, res, next) => {
    try {
        validateRequest(req);
        let { series_id } = req.params;
        const { trailers = [] } = req.body;
        await videoInst.addOrRemoveSeriesTrailers(series_id, trailers);
        const response = await videoInst.getSeries(req.user.id)
            .where({ 'series.id': series_id })
            .first();
        return res.json(apiFmt(response, 'SUCCESS'));
    } catch (e) {
        console.log(e);
        next(e)
    }
}

const handleGetTrailers = async (req, res, next) => {
    try {
        const platform = req.platform;
        const trailers = await models.Video.query()
            .whereExists(
                models.Video.relatedQuery('category')
                    .where({
                        'category_videos.active': true,
                        'category.active': true,
                        'category.name': 'TRAILERS',
                    })
            )
            .where('videos.active', true)
            .modify(query => {
                if (platform == 'WEB') {
                    query.where('is_published_for_web', true);
                } else if (platform == 'APP') {
                    query.where('is_published_for_app', true);
                }
            })
            .select(
                'videos.id',
                'videos.fwp_id',
                'videos.name',
                'videos.description',
                'videos.poster',
                'videos.duration',
                'videos.active',
                'videos.created_at',
                'videos.updated_at',
                raw(`(
                    SELECT ROW_TO_JSON(series) AS series
                        FROM
                            (
                                SELECT sr.*
                                    FROM series AS sr
                                    INNER JOIN series_trailers AS ST ON st."series_id" = sr."id"
                                    AND st."trailer_id" = 35
                                    AND st."active" = TRUE
                            )
                        AS series
                )`)
            );
        return res.json(apiFmt(trailers, 'TRAILERS'));
    } catch (e) {
        next(e);
    }
}

const handleGetSimilarSeries = async (req, res, next) => {
    try {
        validateRequest(req);
        const platform = req.platform;
        const { seriesId } = req.query;
        const genres = await models.Series.relatedQuery('genres')
            .for(seriesId)
            .where({
                'genres.active': true,
                'genre_series.active': true,
            })
            .select('genres.id', 'genres.name');
        const genreIds = genres.map(e => e.id);
        const series = await videoInst.getSeriesList()
            .where('series.id', '!=', seriesId)
            .where('series.active', true)
            .where('series.coming_soon', false)
            .whereExists(
                models.Series.relatedQuery('genres')
                    .whereIn('genres.id', genreIds)
                    .where('genres.active', true)
                    .where('genre_series.active', true)
            )
            .modify(query => {
                if (platform == 'WEB') {
                    query.where('is_published_for_web', true);
                } else if (platform == 'APP') {
                    query.where('is_published_for_app', true);
                }
            });
        return res.json(apiFmt(series, 'SIMILAR SERIES'));
    } catch (e) {
        next(e);
    }
}

const handleUploadSeriesImage = async (req, res, next) => {
    try {
        validateRequest(req);
        if (!req.file) throw new APIError(400, 'File is required');
        const { series_id: seriesId } = req.params;
        const { tag } = req.body;
        const file = req.file;
        file.s3Key = `series/${seriesId}/images/${file.filename}`;
        const key = await uploadImage(file);
        payload = {
            'series_id': seriesId,
            'image': key,
            'tag': tag,
        };
        const result = await Video.addSeriesImage(payload);
        const series = await videoInst.getSeries(req.user.id)
            .where({ 'series.id': seriesId });
        return res.json(apiFmt(series, 'SUCCESS'));
    } catch (e) {
        console.log('handleUploadSeriesImages --- ERROR', e);
        next(e);
    }
}

const handleDeleteSeriesImage = async (req, res, next) => {
    try {
        validateRequest(req);
        const { series_id: seriesId } = req.params;
        const { id: imageId } = req.body;
        const result = await Video.deleteSeriesImage(imageId);
        const series = await videoInst.getSeries(req.user.id)
            .where({ 'series.id': seriesId });
        return res.json(apiFmt(series, 'SUCCESS'));
    } catch (e) {
        console.log('handleDeleteSeriesImages --- ERROR', e);
        next(e);
    }
}

const handleBulkDeleteSeriesImage = async (req, res, next) => {
    try {
        validateRequest(req);
        const { series_id: seriesId } = req.params;
        const { id: imageId } = req.body;
        const result = await Video.bulkDeleteSeriesImages(imageId);
        const series = await videoInst.getSeries(req.user.id)
            .where({ 'series.id': seriesId });
        return res.json(apiFmt(series, 'SUCCESS'));
    } catch (e) {
        console.log('handleBulkDeleteSeriesImages --- ERROR', e);
        next(e);
    }
}

const handleUploadVideoImages = async (req, res, next) => {
    try {
        validateRequest(req);
        if (!req.file) throw new APIError(400, 'File is required');
        const { video_id: videoId } = req.params;
        const { tag } = req.body;
        const file = req.file;
        file.s3Key = `videos/${videoId}/images/${file.filename}`;
        const key = await uploadImage(file);
        payload = {
            'video_id': videoId,
            'image': key,
            'tag': tag,
        };
        const result = await Video.addVideoImage(payload);
        const video = await Video.getVideo().where({
            'videos.id': videoId,
            'videos.active': true
        }).first();
        return res.json(apiFmt(video, 'SUCCESS'));
    } catch (e) {
        console.log('handleUploadVideoImages --- ERROR', e);
        next(e);
    }
}

const handleDeleteVideoImage = async (req, res, next) => {
    try {
        validateRequest(req);
        const { video_id: videoId } = req.params;
        const { id: imageId } = req.body;
        const result = await Video.deleteVideoImage(imageId);
        const video = await Video.getVideo().where({
            'videos.id': videoId,
            'videos.active': true
        }).first();
        return res.json(apiFmt(video, 'SUCCESS'));
    } catch (e) {
        console.log('handleDeleteVideoImages --- ERROR', e);
        next(e);
    }
}

const handleBulkDeleteVideoImage = async (req, res, next) => {
    try {
        validateRequest(req);
        const { video_id: videoId } = req.params;
        const { id: imageId } = req.body;
        const result = await Video.bulkDeleteVideoImages(imageId);
        const video = await Video.getVideo().where({
            'videos.id': videoId,
            'videos.active': true
        }).first();
        return res.json(apiFmt(video, 'SUCCESS'));
    } catch (e) {
        console.log('handleBulkDeleteVideoImage --- ERROR', e);
        next(e);
    }
}

const handleAddVideoEncodings = async (req, res, next) => {
    try {
        validateRequest(req);
        await Video.addVideoEncodings(req.params.videoId, req.body.encodings);
        return res.json(apiFmt(undefined, 'SUCCESS'));
    } catch (e) {
        console.log('handleAddVideoEncodings --- ERROR:', e);
        return next(e);
    }
}

const handleUpdateVideoEncoding = async (req, res, next) => {
    try {
        validateRequest(req);
        let data = req.body;
        const encodingId = data.id;
        delete data.id;
        await Video.updateVideoEncoding(encodingId, data);
        return res.json(apiFmt(undefined, 'SUCCESS'));
    } catch (e) {
        console.log('handleUpdateVideoEncodings --- ERROR:', e);
        return next(e);
    }
}

const handleDeleteVideoEncodings = async (req, res, next) => {
    try {
        validateRequest(req);
        await Video.deleteVideoEncodings(req.body.idList);
        return res.json(apiFmt(undefined, 'SUCCESS'));
    } catch (e) {
        console.log('handleUpdateVideoEncodings --- ERROR:', e);
        return next(e);
    }
}

const handleGetVideoFoldersInS3Bucket = async (req, res, next) => {
    try {
        validateRequest(req);
        const folders = await Video.getVideoBucketFolders();
        return res.json(apiFmt(folders, 'SUCCESS'));
    } catch (e) {
        console.log('handleGetVideoFoldersInS3Bucket --- ERROR:', e);
        return next(e);
    }
}

const handleCreatePresignedUrlForAVideo = async (req, res, next) => {
    try {
        validateRequest(req);
        const url = await Video.createPresignedUrlForAVideo(req.body.folderName, req.body.fileName);
        return res.json(apiFmt(url, 'SUCCESS'));
    } catch (e) {
        console.log('handleCreatePresignedUrlForAVideo --- ERROR:', e);
        return next(e);
    }
}

const handleCreatePresignedUrlForVideoSegments = async (req, res, next) => {
    try {
        validateRequest(req);
        const url = await Video.createPresignedUrlForVideoSegments(req.body.folderName, req.body.fileNameList);
        return res.json(apiFmt(url, 'SUCCESS'));
    } catch (e) {
        console.log('handleCreatePresignedUrlForVideoSegments --- ERROR:', e);
        return next(e);
    }
}

const handleGetHLSFilesInS3Bucket = async (req, res, next) => {
    try {
        validateRequest(req);
        const files = await Video.getVideoBucketHLSFiles(req.query.prefix);
        return res.json(apiFmt(files, 'SUCCESS'));
    } catch (e) {
        console.log('handleGetHLSFilesInS3Bucket --- ERROR:', e);
        return next(e);
    }
}

const handleChangeVideoPublishStatus = async (req, res, next) => {
    try {
        validateRequest(req);
        await Video.changeVideoPublishStatus(req.body);
        return res.json(apiFmt(null, 'SUCCESS'));
    } catch (e) {
        console.log('handleChangeVideoPublishStatus --- ERROR:', e);
        return next(e);
    }
}

const handleChangeSeriesPublishStatus = async (req, res, next) => {
    try {
        validateRequest(req);
        await Video.changeSeriesPublishStatus(req.body);
        return res.json(apiFmt(null, 'SUCCESS'));
    } catch (e) {
        console.log('handleChangeSeriesPublishStatus --- ERROR:', e);
        return next(e);
    }
}

function validate(method) {
    switch (method) {
        case 'createOrUpdateSeries': {
            return [
                param('series_id', 'Invalid Series ID').optional({ nullable: true }).notEmpty().isNumeric(),
                body('name', 'name is a required field').exists().notEmpty().isString(),
                body('description', 'description is a required field').exists().isString(),
                body('poster', 'poster is a required field').exists().isString(),
                body('release_date').exists(),
                body('casts').exists(),
                body('genres').exists(),
                body('featured').exists(),
                body('coming_soon').exists(),
                body('director').exists(),
                body('languages').exists(),
            ]
        }
        case 'createOrUpdateSeason': {
            return [
                param('series_id', 'Invalid Series ID').exists().notEmpty().isNumeric(),
                param('season_id', 'Invalid Season ID').optional({ nullable: true }).notEmpty().isNumeric(),
                body('name', 'name is a required field').exists().notEmpty().isString(),
                body('description', 'description is a required field').exists().isString(),
            ]
        }
        case 'handleDeleteSeries': {
            return [
                param('series_id', 'Invalid Series ID').exists().notEmpty().isNumeric()
            ]
        }
        case 'handleDeleteSeason': {
            return [
                param('series_id', 'Invalid Series ID').exists().notEmpty().isNumeric(),
                param('season_id', 'Invalid Season ID').exists().notEmpty().isNumeric()
            ]
        }
        case 'handleGetVideoList': {
            return [
                query('page', 'Invalid page number').optional({ nullable: true }).notEmpty().isNumeric(),
                query('page_length', 'Invalid page length').optional({ nullable: true }).notEmpty().isNumeric()
            ]
        }
        case 'lookups': {
            return [
                query('name').notEmpty().custom((value) => {
                    const lookups = ['categories', 'genres', 'languages', 'trailers'];
                    const names = value.split(',');
                    if (!names.every(e => lookups.includes(e)))
                        throw new Error("Fetchable lookups are 'categories', 'genres', 'languages', 'trailers'");
                    return true;
                }),
            ]
        }
        case 'addOrRemoveEpisodes': {
            return [
                param('series_id', 'Invalid Series ID').exists().notEmpty().isNumeric(),
                param('season_id', 'Invalid Season ID').exists().notEmpty().isNumeric(),
                body('episodes', 'episodes is a required field').exists().isArray(),
                body('episodes.*.id', 'episode id is a required field').optional({ nullable: false }).isNumeric(),
                body('episodes.*.episode_number', 'episode_number is a required field').optional({ nullable: false }).isNumeric(),
            ]
        }
        case 'addOrRemoveTrailers': {
            return [
                param('series_id', 'Invalid Series ID').exists().notEmpty().isNumeric(),
                body('trailers', 'trailers is a required field').exists().isArray(),
                body('trailers.*.id', 'trailer id is a required field').optional({ nullable: false }).isNumeric(),
            ]
        }
        case 'handleGetSimilarSeries': {
            return [
                query('seriesId', 'Invalid Series ID').exists().notEmpty().isNumeric(),
            ]
        }
        case 'handleUploadSeriesPoster': {
            return [
                body('type').exists().isIn(['ADD', 'REMOVE']),
            ]
        }
        case 'handleUploadVideoPoster': {
            return [
                body('type').exists().isIn(['ADD', 'REMOVE']),
            ]
        }
        case 'handleUploadSeriesImage': {
            return [
                param('series_id', 'Invalid Series ID').exists().notEmpty().isNumeric(),
                body('tag').exists().notEmpty().isString(),
            ];
        }
        case 'handleDeleteSeriesImage': {
            return [
                param('series_id', 'Invalid Series ID').exists().notEmpty().isNumeric(),
                body('id').exists().notEmpty().isNumeric(),
            ];
        }
        case 'handleBulkDeleteSeriesImage': {
            return [
                param('series_id', 'Invalid Series ID').exists().notEmpty().isNumeric(),
                body('id').exists().isArray().isNumeric(),
            ];
        }
        case 'handleUploadVideoImage': {
            return [
                param('video_id', 'Invalid Video ID').exists().notEmpty().isNumeric(),
                body('tag').exists().notEmpty().isString(),
            ];
        }
        case 'handleDeleteVideoImage': {
            return [
                param('video_id', 'Invalid Video ID').exists().notEmpty().isNumeric(),
                body('id').exists().notEmpty().isNumeric(),
            ];
        }
        case 'handleBulkDeleteVideoImage': {
            return [
                param('video_id', 'Invalid Video ID').exists().notEmpty().isNumeric(),
                body('id').exists().isArray().custom((val) => {
                    if (!(val instanceof Array)) throw new Error('id must be an Array');
                    if (!val.every(Number.isInteger)) throw new Error('id must be an array of integers');
                    return true;
                }),
            ];
        }
        case 'handleAddVideoEncodings': {
            return [
                param('videoId', 'Invalid Video ID').exists().notEmpty().isNumeric(),
                body('encodings').exists().isArray().notEmpty(),
                body('encodings.*.url').exists().notEmpty(),
                body('encodings.*.format').exists().notEmpty(),
            ];
        }
        case 'handleUpdateVideoEncoding': {
            return [
                body('id').exists().notEmpty().isNumeric(),
                body('url').exists().notEmpty(),
                body('video_id').exists().notEmpty(),
                body('format').exists().notEmpty(),
            ];
        }
        case 'handleDeleteVideoEncodings': {
            return [
                body('idList').exists().isArray().notEmpty(),
            ];
        }
        case 'handleCreatePresignedUrlForVideoSegments': {
            return [
                body('videoName').exists().notEmpty().isString(),
                body('folderName').exists().notEmpty().isString(),
                body('fileNameList').exists().isArray().notEmpty(),
            ];
        }
        case 'handleGetHLSFilesInS3Bucket': {
            return [
                query('prefix').exists().notEmpty().isString(),
            ];
        }
        case 'handleCreatePresignedUrlForAVideo': {
            return [
                body('videoName').exists().notEmpty().isString(),
                body('folderName').exists().notEmpty().isString(),
                body('fileName').exists().notEmpty().isString(),
            ];
        }
        case 'handleChangeVideoPublishStatus': {
            return [
                body('videoId').exists().notEmpty().isInt(),
                body('publish').exists().notEmpty().isBoolean(),
                body('platform').exists().notEmpty().isIn(['web', 'app']),
            ];
        }
        case 'handleChangeSeriesPublishStatus': {
            return [
                body('seriesId').exists().notEmpty().isInt(),
                body('publish').exists().notEmpty().isBoolean(),
                body('platform').exists().notEmpty().isIn(['web', 'app']),
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

module.exports = {
    handleAddOrRemoveEpisodes,
    handleAddOrRemoveTrailers,
    handleAddVideoEncodings,
    handleBulkDeleteVideoImage,
    handleBulkDeleteSeriesImage,
    handleCompleteSignedUpload,
    handleCreateCategory,
    handleCreateLiveSource,
    handleCreateLivestream,
    handleCreateOrUpdateLiveOverlay,
    handleCreatePlaylist,
    handleCreateSeries,
    handleCreateTranscription,
    handleCreateVideo,
    handleDeleteCategory,
    handleDeleteLiveOverlay,
    handleDeleteLiveSource,
    handleDeleteLivestream,
    handleDeletePlaylist,
    handleCreatePresignedUrlForVideoSegments,
    handleCreatePresignedUrlForAVideo,
    handleDeleteSeason,
    handleDeleteSeries,
    handleDeleteVideoEncodings,
    handleDeleteSeriesImage,
    handleDeleteVideo,
    handleDeleteVideoImage,
    handleGetCategory,
    handleGetHLSFilesInS3Bucket,
    handleGetHomeScreenData,
    handleGetLiveSource,
    handleGetLivestream,
    handleGetNewNHotData,
    handleGetPlaylist,
    handleGetSeries,
    handleGetSeriesList,
    handleGetSeriesPoster,
    handleGetSignedURL,
    handleGetSimilarSeries,
    handleGetTrailers,
    handleGetVideo,
    handleGetVideoList,
    handleGetLookupData,
    handleGetVideoPoster,
    handleGetVideoFoldersInS3Bucket,
    handleListAllVideo,
    handleListCategory,
    handleListLiveSource,
    handleListLivestream,
    handleListPlaylist,
    handleListVideo,
    handleMediaSearch,
    handleUpdateCategory,
    handleUpdateLiveSource,
    handleUpdateLivestream,
    handleUpdateOrCreateSeason,
    handleUpdatePlaylist,
    handleUpdateSeries,
    handleUpdateVideo,
    handleUploadSeriesImage,
    handleUploadVideoImages,
    handleUploadSeriesPoster,
    handleUploadVideoPoster,
    handleUpdateVideoEncoding,
    validate,
    handleChangeVideoPublishStatus,
    handleChangeSeriesPublishStatus,
}