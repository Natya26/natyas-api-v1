const rp = require('request-promise');
const Video = require('./video');
const videoInst = new Video();
const {
    FLOWPLAYER_SITE_NAME = null,
    FLOWPLAYER_SITE_ID = null,
    FLOWPLAYER_USER_ID = null,
    FLOWPLAYER_API_KEY = null,
    FLOWPLAYER_V2_API_BASE_URI = null,
    FLOWPLAYER_V3_API_BASE_URI = null,
} = process.env;

class Flowplayer {

    LIVESTREAMS_BASE_URI = `${FLOWPLAYER_V3_API_BASE_URI}/livestreams`;

    LIVE_SOURCES_BASE_URI = `${FLOWPLAYER_V3_API_BASE_URI}/livesources`;

    PLAYLISTS_BASE_URI = `${FLOWPLAYER_V3_API_BASE_URI}/playlists`;

    CATEGORY_BASE_URI = `${FLOWPLAYER_V3_API_BASE_URI}/categories`;

    VIDEO_BASE_URI = `${FLOWPLAYER_V3_API_BASE_URI}/videos`;

    /**
     * 
     * @param {Object} qs
     * @returns {Promise}
     */
    listCategory = async (qs) => {
        return new Promise(async (resolve, reject) => {
            try {
                qs['workspace_id'] = FLOWPLAYER_SITE_ID;
                const options = {
                    uri: this.CATEGORY_BASE_URI,
                    method: 'GET',
                    headers: {
                        'x-flowplayer-api-key': FLOWPLAYER_API_KEY,
                    },
                    qs,
                    json: true,
                };
                const result = await rp(options);
                resolve(result);
            } catch (e) {
                reject(e)
            }
        })
    }

    /**
     * 
     * @param {Object} body
     * @returns {Promise}
     */
    createCategory = async (body) => {
        return new Promise(async (resolve, reject) => {
            try {
                body['workspace'] = {
                    id: FLOWPLAYER_SITE_ID,
                    name: FLOWPLAYER_SITE_NAME
                };
                const options = {
                    uri: this.CATEGORY_BASE_URI,
                    method: 'POST',
                    headers: {
                        'x-flowplayer-api-key': FLOWPLAYER_API_KEY,
                    },
                    body,
                    json: true,
                };
                const result = await rp(options);
                resolve(result);
            } catch (e) {
                reject(e)
            }
        })
    }

    /**
     * 
     * @param {String} category_id
     * @returns {Promise}
     */
    getCategory = async (category_id) => {
        return new Promise(async (resolve, reject) => {
            try {
                const options = {
                    uri: `${this.CATEGORY_BASE_URI}/${category_id}`,
                    method: 'GET',
                    headers: {
                        'x-flowplayer-api-key': FLOWPLAYER_API_KEY,
                    },
                    json: true,
                };
                const result = await rp(options);
                resolve(result);
            } catch (e) {
                reject(e)
            }
        })
    }

    /**
     * 
     * @param {String} category_id
     * @param {Object} body
     * @returns {Promise}
     */
    updateCategory = async (category_id, body) => {
        return new Promise(async (resolve, reject) => {
            try {
                body['workspace'] = {
                    id: FLOWPLAYER_SITE_ID,
                    name: FLOWPLAYER_SITE_NAME
                };
                const options = {
                    uri: `${this.CATEGORY_BASE_URI}/${category_id}`,
                    method: 'PUT',
                    headers: {
                        'x-flowplayer-api-key': FLOWPLAYER_API_KEY,
                    },
                    body,
                    json: true,
                };
                const result = await rp(options);
                resolve(result);
            } catch (e) {
                reject(e)
            }
        })
    }

    /**
     * 
     * @param {String} category_id
     * @returns {Promise}
     */
    deleteCategory = async (category_id) => {
        return new Promise(async (resolve, reject) => {
            try {
                const options = {
                    uri: `${this.CATEGORY_BASE_URI}/${category_id}`,
                    method: 'DELETE',
                    headers: {
                        'x-flowplayer-api-key': FLOWPLAYER_API_KEY,
                    },
                    json: true,
                };
                const result = await rp(options);
                resolve(result);
            } catch (e) {
                reject(e)
            }
        })
    }

    /**
     * 
     * @param {Object} qs
     * @returns {Promise}
     */
    listLiveSource = async (qs) => {
        return new Promise(async (resolve, reject) => {
            try {
                qs['workspace_id'] = FLOWPLAYER_SITE_ID;
                const options = {
                    uri: this.LIVE_SOURCES_BASE_URI,
                    method: 'GET',
                    headers: {
                        'x-flowplayer-api-key': FLOWPLAYER_API_KEY,
                    },
                    qs,
                    json: true,
                };
                const result = await rp(options);
                resolve(result);
            } catch (e) {
                reject(e)
            }
        })
    }

    /**
     * 
     * @param {Object} body
     * @returns {Promise}
     */
    createLiveSource = async (body) => {
        return new Promise(async (resolve, reject) => {
            try {
                const workspace = {
                    id: FLOWPLAYER_SITE_ID,
                    name: FLOWPLAYER_SITE_NAME
                };
                body['owner'] = workspace;
                body['workspaces'] = [workspace];
                const options = {
                    uri: this.LIVE_SOURCES_BASE_URI,
                    method: 'POST',
                    headers: {
                        'x-flowplayer-api-key': FLOWPLAYER_API_KEY,
                    },
                    body,
                    json: true,
                };
                const result = await rp(options);
                resolve(result);
            } catch (e) {
                reject(e)
            }
        })
    }

    /**
     * 
     * @param {String} livesource_id
     * @returns {Promise}
     */
    getLiveSource = async (livesource_id) => {
        return new Promise(async (resolve, reject) => {
            try {
                const options = {
                    uri: `${this.LIVE_SOURCES_BASE_URI}/${livesource_id}`,
                    method: 'GET',
                    headers: {
                        'x-flowplayer-api-key': FLOWPLAYER_API_KEY,
                    },
                    json: true,
                };
                const result = await rp(options);
                resolve(result);
            } catch (e) {
                reject(e)
            }
        })
    }

    /**
     * 
     * @param {String} livesource_id
     * @param {Object} body
     * @returns {Promise}
     */
    updateLiveSource = async (livesource_id, body) => {
        return new Promise(async (resolve, reject) => {
            try {
                const options = {
                    uri: `${this.LIVE_SOURCES_BASE_URI}/${livesource_id}`,
                    method: 'PUT',
                    headers: {
                        'x-flowplayer-api-key': FLOWPLAYER_API_KEY,
                    },
                    body,
                    json: true,
                };
                const result = await rp(options);
                resolve(result);
            } catch (e) {
                reject(e)
            }
        })
    }

    /**
     * 
     * @param {String} livesource_id
     * @returns {Promise}
     */
    deleteLiveSource = async (livesource_id) => {
        return new Promise(async (resolve, reject) => {
            try {
                const options = {
                    uri: `${this.LIVE_SOURCES_BASE_URI}/${livesource_id}`,
                    method: 'DELETE',
                    headers: {
                        'x-flowplayer-api-key': FLOWPLAYER_API_KEY,
                    },
                    json: true,
                };
                const result = await rp(options);
                resolve(result);
            } catch (e) {
                reject(e)
            }
        })
    }

    /**
     * 
     * @param {Object} qs
     * @returns {Promise}
     */
    listLivestream = async (qs) => {
        return new Promise(async (resolve, reject) => {
            try {
                qs['workspace_id'] = FLOWPLAYER_SITE_ID;
                const options = {
                    uri: this.LIVESTREAMS_BASE_URI,
                    method: 'GET',
                    headers: {
                        'x-flowplayer-api-key': FLOWPLAYER_API_KEY,
                    },
                    qs,
                    json: true,
                };
                const result = await rp(options);
                resolve(result);
            } catch (e) {
                reject(e)
            }
        })
    }

    /**
     * 
     * @param {Object} body
     * @returns {Promise}
     */
    createLivestream = async (body) => {
        return new Promise(async (resolve, reject) => {
            try {
                body['workspace'] = { id: FLOWPLAYER_SITE_ID };
                const options = {
                    uri: this.LIVESTREAMS_BASE_URI,
                    method: 'POST',
                    headers: {
                        'x-flowplayer-api-key': FLOWPLAYER_API_KEY,
                    },
                    body,
                    json: true,
                };
                const result = await rp(options);
                resolve(result);
            } catch (e) {
                reject(e)
            }
        })
    }

    /**
     * 
     * @param {String} livestreams_id
     * @returns {Promise}
     */
    getLivestream = async (livestreams_id) => {
        return new Promise(async (resolve, reject) => {
            try {
                const options = {
                    uri: `${this.LIVESTREAMS_BASE_URI}/${livestreams_id}`,
                    method: 'GET',
                    headers: {
                        'x-flowplayer-api-key': FLOWPLAYER_API_KEY,
                    },
                    json: true,
                };
                const result = await rp(options);
                resolve(result);
            } catch (e) {
                reject(e)
            }
        })
    }

    /**
     * 
     * @param {String} livestreams_id
     * @param {Object} body
     * @returns {Promise}
     */
    updateLivestream = async (livestreams_id, body) => {
        return new Promise(async (resolve, reject) => {
            try {
                body['workspace'] = { id: FLOWPLAYER_SITE_ID };
                const options = {
                    uri: `${this.LIVESTREAMS_BASE_URI}/${livestreams_id}`,
                    method: 'PUT',
                    headers: {
                        'x-flowplayer-api-key': FLOWPLAYER_API_KEY,
                    },
                    body,
                    json: true,
                };
                const result = await rp(options);
                resolve(result);
            } catch (e) {
                reject(e)
            }
        })
    }

    /**
     * 
     * @param {String} livestreams_id
     * @returns {Promise}
     */
    deleteLivestream = async (livestreams_id) => {
        return new Promise(async (resolve, reject) => {
            try {
                const options = {
                    uri: `${this.LIVESTREAMS_BASE_URI}/${livestreams_id}`,
                    method: 'DELETE',
                    headers: {
                        'x-flowplayer-api-key': FLOWPLAYER_API_KEY,
                    },
                    json: true,
                };
                const result = await rp(options);
                resolve(result);
            } catch (e) {
                reject(e)
            }
        })
    }

    /**
     * 
     * @param {String} livestreams_id
     * @param {String} template_id
     * @param {String} idempotency_key
     * @param {Object} body
     * @returns {Promise}
     */
    createOrUpdateLiveOverlay = async (livestreams_id, template_id, idempotency_key, body) => {
        return new Promise(async (resolve, reject) => {
            try {
                let headers = {
                    'x-flowplayer-api-key': FLOWPLAYER_API_KEY,
                };
                if (idempotency_key) headers['idempotency-key'] = idempotency_key;
                const options = {
                    uri: `${this.LIVESTREAMS_BASE_URI}/${livestreams_id}/overlays/${template_id}`,
                    method: 'PUT',
                    headers,
                    body,
                    json: true,
                };
                const result = await rp(options);
                resolve(result);
            } catch (e) {
                reject(e)
            }
        })
    }

    /**
     * 
     * @param {String} overlay_id
     * @param {String} template_id
     * @returns {Promise}
     */
    deleteLiveOverlay = async (overlay_id, template_id) => {
        return new Promise(async (resolve, reject) => {
            try {
                const options = {
                    uri: `${this.LIVESTREAMS_BASE_URI}/${overlay_id}/overlays/${template_id}`,
                    method: 'DELETE',
                    headers: {
                        'x-flowplayer-api-key': FLOWPLAYER_API_KEY,
                    },
                    json: true,
                };
                const result = await rp(options);
                resolve(result);
            } catch (e) {
                reject(e)
            }
        })
    }

    /**
     * 
     * @param {Object} qs
     * @returns {Promise}
     */
    listVideo = async (qs) => {
        return new Promise(async (resolve, reject) => {
            try {
                qs['workspace_id'] = FLOWPLAYER_SITE_ID;
                const options = {
                    uri: this.VIDEO_BASE_URI,
                    method: 'GET',
                    headers: {
                        'x-flowplayer-api-key': FLOWPLAYER_API_KEY,
                    },
                    qs,
                    json: true,
                };
                const result = await rp(options);
                resolve(result);
            } catch (e) {
                reject(e)
            }
        })
    }

    /**
     * 
     * @param {Object} body
     * @returns {Promise}
     */
    createVideo = async (body) => {
        return new Promise(async (resolve, reject) => {
            try {
                body['user_id'] = FLOWPLAYER_USER_ID;
                const options = {
                    uri: this.VIDEO_BASE_URI,
                    method: 'POST',
                    headers: {
                        'x-flowplayer-api-key': FLOWPLAYER_API_KEY,
                    },
                    body,
                    json: true,
                };
                const result = await rp(options);
                resolve(result);
            } catch (e) {
                reject(e)
            }
        })
    }

    /**
     * 
     * @param {String} video_id
     * @returns {Promise}
     */
    getVideo = async (video_id) => {
        return new Promise(async (resolve, reject) => {
            try {
                const options = {
                    uri: `${this.VIDEO_BASE_URI}/${video_id}`,
                    method: 'GET',
                    headers: {
                        'x-flowplayer-api-key': FLOWPLAYER_API_KEY,
                    },
                    json: true,
                };
                const result = await rp(options);
                resolve(result);
            } catch (e) {
                reject(e)
            }
        })
    }

    /**
     * 
     * @param {String} video_id
     * @param {Object} body
     * @returns {Promise}
     */
    updateVideo = async (video_id, body) => {
        return new Promise(async (resolve, reject) => {
            try {
                body['user_id'] = FLOWPLAYER_USER_ID;
                const options = {
                    uri: `${this.VIDEO_BASE_URI}/${video_id}`,
                    method: 'PUT',
                    headers: {
                        'x-flowplayer-api-key': FLOWPLAYER_API_KEY,
                    },
                    body,
                    json: true,
                };
                const result = await rp(options);
                resolve(result);
            } catch (e) {
                reject(e)
            }
        })
    }

    /**
     * 
     * @param {String} video_id
     * @returns {Promise}
     */
    deleteVideo = async (video_id) => {
        return new Promise(async (resolve, reject) => {
            try {
                const options = {
                    uri: `${this.VIDEO_BASE_URI}/${video_id}`,
                    method: 'DELETE',
                    headers: {
                        'x-flowplayer-api-key': FLOWPLAYER_API_KEY,
                    },
                    json: true,
                };
                const result = await rp(options);
                resolve(result);
            } catch (e) {
                reject(e)
            }
        })
    }

    /**
     * 
     * @param {Object} body
     * @returns {Promise}
     */
    getSignedURL = async (body) => {
        return new Promise(async (resolve, reject) => {
            try {
                body['api_key'] = FLOWPLAYER_API_KEY;
                body['site_id'] = FLOWPLAYER_SITE_ID;
                body['user_id'] = FLOWPLAYER_USER_ID;
                const options = {
                    uri: `${FLOWPLAYER_V2_API_BASE_URI}/web/video/v2/signed-upload-url`,
                    method: 'POST',
                    headers: {
                        'x-flowplayer-api-key': FLOWPLAYER_API_KEY,
                    },
                    body,
                    json: true,
                };
                let result = await rp(options);
                let videoPayload = {
                    name: body.name,
                    fwp_id: result.video_id,
                    active: false
                };
                const video = await Video.createVideo(videoPayload);
                resolve({ signed_video_url: result.signed_video_url, video });
            } catch (e) {
                reject(e)
            }
        })
    }

    /**
     * 
     * @param {Object} body
     * @returns {Promise}
     */
    completeSignedUpload = async (body) => {
        return new Promise(async (resolve, reject) => {
            try {
                body['api_key'] = FLOWPLAYER_API_KEY;
                const options = {
                    uri: `${FLOWPLAYER_V2_API_BASE_URI}/web/video/v2/signed-upload-complete`,
                    method: 'POST',
                    headers: {
                        'x-flowplayer-api-key': FLOWPLAYER_API_KEY,
                    },
                    body,
                    json: true,
                };
                const metadata = await Video.updateVideo({ active: true }, { fwp_id: body.id });
                const result = await rp(options);
                resolve({ requestStatus: result, metadata });
            } catch (e) {
                reject(e)
            }
        })
    }

    /**
     * 
     * @param {Object} qs
     * @returns {Promise}
     */
    listPlaylist = async (qs) => {
        return new Promise(async (resolve, reject) => {
            try {
                const options = {
                    uri: this.PLAYLISTS_BASE_URI,
                    method: 'GET',
                    headers: {
                        'x-flowplayer-api-key': FLOWPLAYER_API_KEY,
                    },
                    qs,
                    json: true,
                };
                const result = await rp(options);
                resolve(result);
            } catch (e) {
                reject(e)
            }
        })
    }

    /**
     * 
     * @param {Object} body
     * @returns {Promise}
     */
    createPlaylist = async (body) => {
        return new Promise(async (resolve, reject) => {
            try {
                body['workspace'] = {
                    id: FLOWPLAYER_SITE_ID,
                    name: FLOWPLAYER_SITE_NAME
                };
                const options = {
                    uri: this.PLAYLISTS_BASE_URI,
                    method: 'POST',
                    headers: {
                        'x-flowplayer-api-key': FLOWPLAYER_API_KEY,
                    },
                    body,
                    json: true,
                };
                const result = await rp(options);
                resolve(result);
            } catch (e) {
                reject(e)
            }
        })
    }

    /**
     * 
     * @param {String} playlist_id
     * @returns {Promise}
     */
    getPlaylist = async (playlist_id) => {
        return new Promise(async (resolve, reject) => {
            try {
                const options = {
                    uri: `${this.PLAYLISTS_BASE_URI}/${playlist_id}`,
                    method: 'GET',
                    headers: {
                        'x-flowplayer-api-key': FLOWPLAYER_API_KEY,
                    },
                    json: true,
                };
                const result = await rp(options);
                resolve(result);
            } catch (e) {
                reject(e)
            }
        })
    }

    /**
     * 
     * @param {String} playlist_id
     * @param {Object} body
     * @returns {Promise}
     */
    updatePlaylist = async (playlist_id, body) => {
        return new Promise(async (resolve, reject) => {
            try {
                body['workspace'] = {
                    id: FLOWPLAYER_SITE_ID,
                    name: FLOWPLAYER_SITE_NAME
                };
                const options = {
                    uri: `${this.PLAYLISTS_BASE_URI}/${playlist_id}`,
                    method: 'PUT',
                    headers: {
                        'x-flowplayer-api-key': FLOWPLAYER_API_KEY,
                    },
                    body,
                    json: true,
                };
                const result = await rp(options);
                resolve(result);
            } catch (e) {
                reject(e)
            }
        })
    }

    /**
     * 
     * @param {String} playlist_id
     * @returns {Promise}
     */
    deletePlaylist = async (playlist_id) => {
        return new Promise(async (resolve, reject) => {
            try {
                const options = {
                    uri: `${this.PLAYLISTS_BASE_URI}/${playlist_id}`,
                    method: 'DELETE',
                    headers: {
                        'x-flowplayer-api-key': FLOWPLAYER_API_KEY,
                    },
                    json: true,
                };
                const result = await rp(options);
                resolve(result);
            } catch (e) {
                reject(e)
            }
        })
    }

    /**
     * 
     * @param {String} video_id
     * @param {Object} body
     * @returns {Promise}
     */
    createTranscription = async (video_id, body) => {
        return new Promise(async (resolve, reject) => {
            try {
                const options = {
                    uri: `${this.VIDEO_BASE_URI}/${video_id}/transcriptions`,
                    method: 'POST',
                    headers: {
                        'x-flowplayer-api-key': FLOWPLAYER_API_KEY,
                    },
                    body,
                    json: true,
                };
                const result = await rp(options);
                resolve(result);
            } catch (e) {
                reject(e)
            }
        })
    }
}

module.exports = Flowplayer;