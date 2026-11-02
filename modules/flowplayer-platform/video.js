const moment = require('moment');
const db = require('../db');
const dbUtils = require('../db/utils');
const APIError = require('../errors/APIError');
const { raw } = require('objection');
const models = require('../db/models');
const { apiFmt } = require('../services/fmt');
const s3 = require('../s3');

class Video {
    constructor() {
        //
    }

    static async createVideo(body = {}) {
        return new Promise(async (resolve, reject) => {
            try {
                Object
                    .keys(body)
                    .forEach(key => ((body[key] === undefined) || (body[key] === null) && delete body[key]));;
                body['fwp_id'] = await this.generateVideoUUID();
                const video = await db.insertDoc('videos', body);
                return resolve(video);
            } catch (e) {
                return reject(e);
            }
        });
    }

    static async updateVideo(body = {}, whereCondition = {}) {
        return new Promise(async (resolve, reject) => {
            try {
                Object
                    .keys(body)
                    .forEach(key => ((body[key] === undefined) || (body[key] === null) && delete body[key]));;
                const queryBuilder = db.getQueryBuilder('videos');
                const video = await queryBuilder.where(whereCondition)
                    .update(body)
                    .returning('*');
                return resolve(dbUtils.parseWriteResponse(video));
            } catch (e) {
                return reject(e);
            }
        });
    }

    static getVideoList(limit = undefined, offset = undefined, orderBy = []) {
        try {
            return models.Video.query()
                .withGraphFetched('[category, genres, language, images]')// series, season,
                .modifyGraph('category', query => query
                    .where('category_videos.active', true)
                    .where('categories.active', true)
                    .select('categories.id', 'categories.name')
                )
                .modifyGraph('genres', query => query
                    .where('genre_videos.active', true)
                    .where('genres.active', true)
                    .select('genres.id', 'genres.name')
                )
                .modifyGraph('images', query => query
                    .where('video_images.active', true)
                )
                // .modifyGraph('series', query => query
                //     .where('series.active', true)
                // )
                // .modifyGraph('season', query => query
                //     .where('seasons.active', true)
                // )
                .modifyGraph('language', query => query
                    .where('languages.active', true)
                    .select('languages.id', 'languages.code', 'languages.name')
                )
                .select('videos.*')
                .modify(query => {
                    if (limit)
                        query.limit(limit);
                    if (offset)
                        query.offset(offset);
                    if (orderBy.length)
                        query.orderBy(orderBy);
                    return query;
                });
        } catch (e) {
            throw e;
        }
    }

    static getVideo() {
        try {
            return models.Video.query()
                .withGraphFetched('[category, genres, series, season, language, images, encodings]')
                .modifyGraph('encodings', q => q
                    .where('video_encodings.active', true)
                    .select('id', 'video_id', 'url', 'format')
                )
                .modifyGraph('category', query => query
                    .where('category_videos.active', true)
                    .where('categories.active', true)
                    .select('categories.id', 'categories.name')
                )
                .modifyGraph('genres', query => query
                    .where('genre_videos.active', true)
                    .where('genres.active', true)
                    .select('genres.id', 'genres.name')
                )
                .modifyGraph('series', query => query
                    .where('series.active', true)
                )
                .modifyGraph('season', query => query
                    .where('seasons.active', true)
                )
                .modifyGraph('language', query => query
                    .where('languages.active', true)
                    .select('languages.id', 'languages.code', 'languages.name')
                )
                .modifyGraph('images', query => query
                    .where('video_images.active', true)
                )
                .select('videos.*');
        } catch (e) {
            throw e;
        }
    }

    async updateOrCreateVideoCategory(videoId, payload) {
        return new Promise(async (resolve, reject) => {
            try {
                let createData = [];
                const categoryIds = payload.map(el => el.id);
                await db.getQueryBuilder('category_videos')
                    .where({ 'video_id': videoId })
                    .whereNotIn('category_id', categoryIds)
                    .update({ 'active': false });
                await db.getQueryBuilder('category_videos')
                    .where({ 'video_id': videoId, 'active': true })
                    .whereIn('category_id', categoryIds)
                    .returning('*')
                    .then(result => {
                        const ids = result.map(el => el.category_id);
                        categoryIds.forEach(el => {
                            if (ids.includes(el)) return;
                            createData.push({ video_id: videoId, category_id: el });
                        });
                    });
                if (createData.length) await db.getQueryBuilder('category_videos').insert(createData);
                return resolve('SUCCESS')
            } catch (e) {
                return reject(e);
            }
        });
    }

    async updateOrCreateVideoGenre(videoId, payload) {
        return new Promise(async (resolve, reject) => {
            try {
                let createData = [];
                const genreIds = payload.map(el => el.id);
                await db.getQueryBuilder('genre_videos')
                    .where({ 'video_id': videoId })
                    .whereNotIn('genre_id', genreIds)
                    .update({ 'active': false });
                await db.getQueryBuilder('genre_videos').where({ 'video_id': videoId, 'active': true })
                    .whereIn('genre_id', genreIds)
                    .returning('*')
                    .then(result => {
                        const ids = result.map(el => el.genre_id);
                        genreIds.forEach(el => {
                            if (ids.includes(el)) return;
                            createData.push({ video_id: videoId, genre_id: el });
                        });
                    });
                if (createData.length) await db.getQueryBuilder('genre_videos').insert(createData);
                return resolve('SUCCESS')
            } catch (e) {
                return reject(e);
            }
        });
    }

    async handleUpdateVideo(videoId, payload) {
        return new Promise(async (resolve, reject) => {
            try {
                const video = await Video.updateVideo(payload['video'], { fwp_id: videoId });
                await this.updateOrCreateVideoCategory(video.id, payload['category']);
                await this.updateOrCreateVideoGenre(video.id, payload['genre']);
                await Video.addOrRemoveVideoEncodings(video.id, payload['encodings'][0]);
                const response = await Video.getVideo().where('videos.fwp_id', videoId).first();
                return resolve(response);
            } catch (e) {
                return reject(e);
            }
        });
    }

    async handleDeleteVideo(videoId) {
        return new Promise(async (resolve, reject) => {
            try {
                const video = await Video.updateVideo({ active: false }, { fwp_id: videoId });
                await db.getQueryBuilder('category_videos')
                    .where({ video_id: video.id, active: true })
                    .update({ active: false });
                await db.getQueryBuilder('genre_videos')
                    .where({ video_id: video.id, active: true })
                    .update({ active: false });
                resolve(video);
            } catch (e) {
                reject(e);
            }
        });
    }

    async createSeries(payload = {}) {
        return new Promise(async (resolve, reject) => {
            try {
                Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);
                if (payload['casts']) payload['casts'] = JSON.stringify(payload['casts']);
                const series = await db.getQueryBuilder('series')
                    .insert(payload)
                    .returning('*');
                return resolve(dbUtils.parseWriteResponse(series));
            } catch (e) {
                return reject(e);
            }
        });
    }

    async updateSeries(id, payload = {}) {
        return new Promise(async (resolve, reject) => {
            try {
                Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);
                if (payload['casts']) payload['casts'] = JSON.stringify(payload['casts']);
                const series = await db.getQueryBuilder('series')
                    .update(payload)
                    .where({ id })
                    .returning('*');
                return resolve(dbUtils.parseWriteResponse(series));
            } catch (e) {
                return reject(e);
            }
        });
    }

    async updateOrCreateSeason(id = null, payload = {}) {
        return new Promise(async (resolve, reject) => {
            try {
                let season = null;
                if (id) {
                    season = await db.updateDoc('seasons', id, payload);
                    return resolve(season);
                }
                season = await db.insertDoc('seasons', payload);
                return resolve(season);
            } catch (e) {
                reject(e);
            }
        });
    }

    async addOrRemoveSeasonEpisode({ seriesId = null, seasonId = null }, episodes = []) {
        return new Promise(async (resolve, reject) => {
            try {
                const episodeIds = episodes.map(e => e.id);
                //Remove Episodes
                const removed = await db.getQueryBuilder('videos')
                    .whereNotIn('id', episodeIds)
                    .where({
                        'series_id': seriesId,
                        'season_id': seasonId,
                        'active': true,
                    })
                    .update({
                        'series_id': null,
                        'season_id': null,
                        'episode_number': null 
                    });
                //Add/Update Episodes
                for (const episode of episodes) {
                    let result = await db.getQueryBuilder('videos')
                        .where('id', episode.id)
                        .update({
                            'series_id': seriesId,
                            'season_id': seasonId,
                            'episode_number': episode.episode_number,
                        });
                }
                return resolve(removed > 0 ? 'REMOVED' : 'ADDED');
            } catch (e) {
                return reject(e);
            }
        });
    }

    getSeriesList(limit = undefined, offset = undefined, orderBy = []) {
        try {
            return models.Series.query()
                .select(
                    'series.*',
                    models.Series.relatedQuery('seasons')
                        .select(raw('COUNT(DISTINCT(seasons.id))::INTEGER'))
                        .where('seasons.active', true)
                        .as('season_count'),
                    models.Series.relatedQuery('episodes')
                        .select(raw('COUNT(DISTINCT(episodes.id))::INTEGER'))
                        .where('episodes.active', true)
                        .as('episode_count'),
                    models.Series.relatedQuery('likedBy')
                        .where('series_likes.active', true)
                        .select(raw('COUNT(DISTINCT("likedBy"."id"))::INTEGER'))
                        .as('likes')
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
                    query.where('series_images.active', true)
                })
                .modify(query => {
                    if (orderBy.length)
                        query.orderBy(orderBy)
                    if (limit)
                        query.limit(limit);
                    if (offset)
                        query.offset(offset);
                });
        } catch (e) {
            throw e;
        }
    }

    getSeries(userId) {
        try {
            return models.Series.query()
                .select(
                    'series.*',
                    models.Series.relatedQuery('seasons')
                        .select(raw('COUNT(DISTINCT(seasons.id))::INTEGER'))
                        .where('seasons.active', true)
                        .as('season_count'),
                    models.Series.relatedQuery('episodes')
                        .select(raw('COUNT(DISTINCT(episodes.id))::INTEGER'))
                        .where('episodes.active', true)
                        .as('episode_count'),
                    raw('(? > 0) AS "isInMyList"', models.Series.relatedQuery('inMyListOf')
                        .where('my_lists.user_id', userId)
                        .where('my_lists.active', true)
                        .count()
                    ),
                    raw('(? > 0) AS "isLiked"', models.Series.relatedQuery('likedBy')
                        .where('series_likes.user_id', userId)
                        .where('series_likes.active', true)
                        .count()
                    ),
                    models.Series.relatedQuery('likedBy')
                        .where('series_likes.active', true)
                        .select(raw('COUNT(DISTINCT("likedBy"."id"))::INTEGER'))
                        .as('likes')
                )
                .withGraphFetched('[genres, languages, trailers, seasons.[episodes], images]')
                .modifyGraph('genres', query => {
                    query.where('genre_series.active', true)
                        .where('genres.active', true)
                        .select('genres.id', 'genres.name');
                })
                .modifyGraph('languages', query => {
                    query.where('language_series.active', true)
                        .where('languages.active', true)
                        .select('languages.id', 'languages.name');
                })
                .modifyGraph('trailers', query => {
                    query.where('series_trailers.active', true)
                        .where('videos.active', true)
                })
                .modifyGraph('seasons', query => {
                    query.where('seasons.active', true)
                        .orderBy('seasons.season_number', 'ASC')
                })
                .modifyGraph('seasons.episodes', query => {
                    query.where('videos.active', true)
                        .orderBy('videos.episode_number', 'ASC');
                })
                .modifyGraph('images', query => {
                    query.where('series_images.active', true)
                });
        } catch (e) {
            throw e;
        }
    }

    async deleteSeries(seriesId) {
        return new Promise(async (resolve, reject) => {
            try {
                await db.getQueryBuilder('series')
                    .update({ 'active': false })
                    .where({ 'id': seriesId });
                await db.getQueryBuilder('seasons')
                    .update({ 'active': false })
                    .where({
                        'series_id': seriesId,
                        'active': true,
                    });
                await db.getQueryBuilder('genre_series')
                    .update({ 'active': false })
                    .where({
                        'series_id': seriesId,
                        'active': true,
                    });
                await db.getQueryBuilder('videos')
                    .update({
                        'series_id': null,
                        'season_id': null,
                        'episode_number': null,
                    })
                    .where({ 'series_id': seriesId });
                await db.getQueryBuilder('language_series')
                    .update({ 'active': false })
                    .where({
                        'series_id': seriesId,
                        'active': true,
                    });
                return resolve({ id: seriesId });
            } catch (e) {
                reject(e);
            }
        });
    }

    async deleteSeason(seriesId, seasonId) {
        return new Promise(async (resolve, reject) => {
            try {
                await db.getQueryBuilder('seasons')
                    .update({ 'active': false })
                    .where({
                        'series_id': seriesId,
                        'id': seasonId,
                        'active': true,
                    });
                await db.getQueryBuilder('videos')
                    .update({
                        'series_id': null,
                        'season_id': null,
                        'episode_number': null,
                    })
                    .where({
                        'series_id': seriesId,
                        'season_id': seasonId
                    });
                return resolve({ id: seasonId, series_id: seriesId });
            } catch (e) {
                reject(e);
            }
        });
    }

    async addOrRemoveSeriesGenre(seriesId, payload) {
        return new Promise(async (resolve, reject) => {
            try {
                let createData = [];
                const genreIds = payload.map(el => el.id);
                await db.getQueryBuilder('genre_series')
                    .where({ 'series_id': seriesId })
                    .whereNotIn('genre_id', genreIds)
                    .update({ 'active': false });
                await db.getQueryBuilder('genre_series').where({ 'series_id': seriesId, 'active': true })
                    .whereIn('genre_id', genreIds)
                    .returning('*')
                    .then(result => {
                        const ids = result.map(el => el.genre_id);
                        genreIds.forEach(el => {
                            if (ids.includes(el)) return;
                            createData.push({ series_id: seriesId, genre_id: el });
                        });
                    });
                if (createData.length) await db.getQueryBuilder('genre_series').insert(createData);
                return resolve('SUCCESS');
            } catch (e) {
                return reject(e);
            }
        });
    }

    async addOrRemoveSeriesLanguage(seriesId, payload) {
        return new Promise(async (resolve, reject) => {
            try {
                let createData = [];
                const languageIds = payload.map(el => el.id);
                await db.getQueryBuilder('language_series')
                    .where({ 'series_id': seriesId })
                    .whereNotIn('language_id', languageIds)
                    .update({ 'active': false });
                await db.getQueryBuilder('language_series').where({ 'series_id': seriesId, 'active': true })
                    .whereIn('language_id', languageIds)
                    .returning('*')
                    .then(result => {
                        const ids = result.map(el => el.language_id);
                        languageIds.forEach(el => {
                            if (ids.includes(el)) return;
                            createData.push({ series_id: seriesId, language_id: el });
                        });
                    });
                if (createData.length) await db.getQueryBuilder('language_series').insert(createData);
                return resolve('SUCCESS');
            } catch (e) {
                return reject(e);
            }
        });
    }

    async addOrRemoveSeriesTrailers(seriesId, payload) {
        return new Promise(async (resolve, reject) => {
            try {
                let createData = [];
                const trailerIds = payload.map(el => el.id);
                await db.getQueryBuilder('series_trailers')
                    .where({ 'series_id': seriesId })
                    .whereNotIn('trailer_id', trailerIds)
                    .update({ 'active': false });
                await db.getQueryBuilder('series_trailers').where({ 'series_id': seriesId, 'active': true })
                    .whereIn('trailer_id', trailerIds)
                    .returning('*')
                    .then(result => {
                        const ids = result.map(el => el.trailer_id);
                        trailerIds.forEach(el => {
                            if (ids.includes(el)) return;
                            createData.push({ series_id: seriesId, trailer_id: el });
                        });
                    });
                if (createData.length) await db.getQueryBuilder('series_trailers').insert(createData);
                return resolve('SUCCESS');
            } catch (e) {
                return reject(e);
            }
        });
    }

    static async addSeriesImage(payload) {
        return new Promise(async (resolve, reject) => {
            try {
                Object.keys(payload).forEach(key => (payload[key] == undefined && delete payload[key]));
                const result = await db.insertDoc('series_images', payload);
                return resolve(result);
            } catch (e) {
                return reject(e);
            }
        });
    }

    static async updateSeriesImage(id, payload) {
        return new Promise(async (resolve, reject) => {
            try {
                Object.keys(payload).forEach(key => (payload[key] == undefined && delete payload[key]));
                const result = await db.updateDoc('series_images', id, payload);
                return resolve(result);
            } catch (e) {
                return reject(e);
            }
        });
    }

    static async deleteSeriesImage(id) {
        return new Promise(async (resolve, reject) => {
            try {
                const payload = { active: false };
                const result = await this.updateSeriesImage(id, payload);
                return resolve(result);
            } catch (e) {
                return reject(e);
            }
        });
    }

    static async bulkDeleteSeriesImages(id = []) {
        return new Promise(async (resolve, reject) => {
            try {
                const payload = { active: false };
                const result = await db.getQueryBuilder('series_images')
                    .whereIn('id', id)
                    .update(payload)
                    .returning('*');
                return resolve(result);
            } catch (e) {
                return reject(e);
            }
        });
    }

    static async addVideoImage(payload) {
        return new Promise(async (resolve, reject) => {
            try {
                Object.keys(payload).forEach(key => (payload[key] == undefined && delete payload[key]));
                console.log({ payload });
                const result = await db.insertDoc('video_images', payload);
                return resolve(result);
            } catch (e) {
                return reject(e);
            }
        });
    }

    static async updateVideoImage(id, payload) {
        return new Promise(async (resolve, reject) => {
            try {
                Object.keys(payload).forEach(key => (payload[key] == undefined && delete payload[key]));
                const result = await db.updateDoc('video_images', id, payload);
                return resolve(result);
            } catch (e) {
                return reject(e);
            }
        });
    }

    static async deleteVideoImage(id) {
        return new Promise(async (resolve, reject) => {
            try {
                const payload = { active: false };
                const result = await this.updateVideoImage(id, payload);
                return resolve(result);
            } catch (e) {
                return reject(e);
            }
        });
    }

    static async bulkDeleteVideoImages(id = []) {
        return new Promise(async (resolve, reject) => {
            try {
                const payload = { active: false };
                const result = await db.getQueryBuilder('video_images')
                    .whereIn('id', id)
                    .update(payload)
                    .returning('*');
                return resolve(result);
            } catch (e) {
                return reject(e);
            }
        });
    }
/**
 * [
 *  {
 *      "url": "",
 *      "format": ""
 *  }
 * ]
 * 
 */
    static async addVideoEncodings(videoId, data = []) {
        return new Promise(async (resolve, reject) => {
            try {
                const payload = [];
                data.forEach(encoding => payload.push({video_id: videoId, ...encoding}));
                if (payload .length === 0) return resolve(apiFmt(undefined, 'Empty payload', true));
                await db.insertDoc('video_encodings', payload);
                return resolve();
            } catch (e) {
                return reject(e);
            }
        });
    }

    static async updateVideoEncoding(encodingId, payload) {
        return new Promise(async (resolve, reject) => {
            try {
                Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);
                await db.updateDoc('video_encodings', encodingId, payload);
                return resolve();
            } catch (e) {
                return reject(e);
            }
        });
    }

    static async deleteVideoEncodings(idList = []) {
        return new Promise(async (resolve, reject) => {
            try {
                await db.getQueryBuilder('video_encodings')
                    .whereIn('id', idList)
                    .update({
                        'active': false,
                    });
                return resolve();
            } catch (e) {
                return reject(e);
            }
        });
    }

    static async getVideoBucketFolders() {
        return new Promise(async (resolve, reject) => {
            try {
                const folders = await s3.getVideoFolderListInBucket();
                const result = folders.CommonPrefixes.map(item => item.Prefix);
                return resolve(result);
            } catch (e) {
                return reject(e);
            }
        });
    }

    static async createPresignedUrlForAVideo(folderName = '/', fileName, videoName = 'Video Name') {
        return new Promise(async (resolve, reject) => {
            try {
                if (fileName === undefined || fileName == '') throw new APIError(`fileName cannot be empty or `);
                const url = await s3.createPresignedUrlWithoutClientForVideo(`${folderName}${fileName}`);
                
                const video = await this.createVideo({
                    name: videoName,
                    description: videoName
                });
                return resolve(url);
            } catch (e) {
                return reject(e);
            }
        });
    }

    static async createPresignedUrlForVideoSegments(folderName = '/', fileNameList = [], videoName = 'Video Name') {
        return new Promise(async (resolve, reject) => {
            try {
                if (!Array.isArray(fileNameList)) throw new APIError('fileNameList must be an array.');
                if (fileNameList.length == 0) throw new APIError('fileNameList cannot be empty.');
                const urlList = [];
                for (const fileName of fileNameList) {
                    const url = await s3.createPresignedUrlWithoutClientForVideo(`${folderName}${fileName}`);
                    urlList.push({ fileName, url });
                }
                const video = await this.createVideo({
                    name: videoName,
                    description: videoName
                });
                return resolve({ urlList, video });
            } catch (e) {
                return reject(e);
            }
        });
    }

    static async getVideoBucketHLSFiles(prefix) {
        return new Promise(async (resolve, reject) => {
            try {
                const files = await s3.getFilesInVideoBucket(prefix);
                const result = files.Contents
                    .filter(item => item.Key.endsWith('.m3u8'))
                    .map(item => ({key: item.Key}));
                return resolve(result);
            } catch (e) {
                return reject(e);
            }
        });
    }

    static async generateVideoUUID() {
        function uuidv4() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }
        let random = uuidv4();
        let uuidQuery = db.getQueryBuilder('videos').where({ fwp_id: random }).first()
        let uuid = await db.executeQuery(uuidQuery)
        if (!uuid) return random
        else this.generatePaymentToken()
    }

    static async addOrRemoveVideoEncodings(videoId, payload = {}) {
        new Promise(async (resolve, reject) => {
            try {
                Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);
                payload['video_id'] = videoId;
                const encodingId = payload['id'];
                delete payload['id'];
                if (!payload['url']) throw new APIError('encodings.url cannot be empty or undefined.');
                if (!payload['url'].startsWith(process.env.CLOUDFRONT_DISTRIBUTION_DOMAIN)) {
                    payload['url'] = process.env.CLOUDFRONT_DISTRIBUTION_DOMAIN + payload['url'];
                }
                console.log({ payload });
                let recordExistsQuery = db.getQueryBuilder('video_encodings')
                    .where('video_id', videoId)
                    if (encodingId) {
                        recordExistsQuery.where('id', encodingId)
                    }
                const recordExists = await recordExistsQuery.first();
                if (recordExists) {
                    await db.updateDoc('video_encodings', recordExists.id, payload);
                } else {
                    await db.insertDoc('video_encodings', payload);
                }
                return resolve();
            } catch (e) {
                return reject(e);
            }
        });
    }

    /**
     *@typedef ChangeVideoPublishStatusPayload
     * @type {object}
     * @property {number} videoId - video identifier.
     * @property {boolean} publish - publish status.
     * @property {'web' | 'app'} platform - publishing platform.
     */

    /**
     * 
     * @param {ChangeVideoPublishStatusPayload} payload 
     * @returns 
     */
    static async changeVideoPublishStatus(payload) {
        return new Promise(async (resolve, reject) => {
            try {
                const { videoId, publish, platform } = payload;
                
                if (!['web', 'app'].includes(platform)) throw new APIError(400, 'INVALID PLATFORM');

                const videoExists = await db.getQueryBuilder('videos')
                    .where({
                        'active' : true,
                        'id'     : videoId,
                    })
                    .first();

                if ( typeof videoExists != 'object' && !videoExists ) throw new APIError(400, 'VIDEO NOT FOUND');

                let updatedValues = {};
                
                updatedValues[`is_published_for_${platform}`] = publish;

                await Video.updateVideo(updatedValues, { id: videoId });
                
                return resolve();
            } catch (e) {
                return reject(e);
            }
        });
    }

    /**
     * @typedef ChangeSeriesPublishStatusPayload
     * @type  {object}
     * @property {number} seriesId
     * @property {boolean} publish
     * @property { 'web' | 'app' } platform
     */
    
    /**
     * 
     * @param {ChangeSeriesPublishStatusPayload} payload 
     * @returns 
     */
    static async changeSeriesPublishStatus(payload) {
        return new Promise(async (resolve, reject) => {
            try {
                const { seriesId, publish, platform } = payload;
                
                if (!['web', 'app'].includes(platform)) throw new APIError(400, 'INVALID PLATFORM');

                const seriesExists = await db.getQueryBuilder('series')
                    .where({
                        'active' : true,
                        'id'     : seriesId,
                    })
                    .first();

                if ( typeof seriesExists != 'object' && !seriesExists ) throw new APIError(400, 'VIDEO NOT FOUND');

                let updatedValues = {};
                
                updatedValues[`is_published_for_${platform}`] = publish;
                
                await (new Video()).updateSeries(seriesId, updatedValues);
                
                return resolve();
            } catch (e) {
                return reject(e);
            }
        });
    }
}

module.exports = Video;