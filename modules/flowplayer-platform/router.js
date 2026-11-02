const { Router } = require('express');
const ctrl = require('./ctrl');
const multer = require('../uploads/multer');
const { ROLES, roleAuthMiddleware } = require('./../authentication/middleware');
const { ADMIN, SUBSCRIBER } = ROLES;
const router = Router();

router.get('/category/list', roleAuthMiddleware([ADMIN]), ctrl.handleListCategory);

router.post('/category/create', roleAuthMiddleware([ADMIN]), ctrl.handleCreateCategory);

router.get('/category/:category_id/get', roleAuthMiddleware([ADMIN]), ctrl.handleGetCategory);

router.post('/category/:category_id/update', roleAuthMiddleware([ADMIN]), ctrl.handleUpdateCategory);

router.get('/category/:category_id/delete', roleAuthMiddleware([ADMIN]), ctrl.handleDeleteCategory);

router.get('/livesources/list', roleAuthMiddleware([ADMIN]), ctrl.handleListLiveSource);

router.post('/livesources/create', roleAuthMiddleware([ADMIN]), ctrl.handleCreateLiveSource);

router.get('/livesources/:livesource_id/get', roleAuthMiddleware([ADMIN]), ctrl.handleGetLiveSource);

router.post('/livesources/:livesource_id/update', roleAuthMiddleware([ADMIN]), ctrl.handleUpdateLiveSource);

router.get('/livesources/:livesource_id/delete', roleAuthMiddleware([ADMIN]), ctrl.handleDeleteLiveSource);

router.get('/livestreams/list', roleAuthMiddleware([ADMIN]), ctrl.handleListLivestream);

router.post('/livestreams/create', roleAuthMiddleware([ADMIN]), ctrl.handleCreateLivestream);

router.get('/livestreams/:livestreams_id/get', roleAuthMiddleware([ADMIN]), ctrl.handleGetLivestream);

router.post('/livestreams/:livestreams_id/update', roleAuthMiddleware([ADMIN]), ctrl.handleUpdateLivestream);

router.get('/livestreams/:livestreams_id/delete', roleAuthMiddleware([ADMIN]), ctrl.handleDeleteLivestream);

router.post('/livestreams/:livestreams_id/overlays/:template_id/create-update', roleAuthMiddleware([ADMIN]), ctrl.handleCreateOrUpdateLiveOverlay);

router.get('/livestreams/:overlay_id/overlays/:template_id/delete', roleAuthMiddleware([ADMIN]), ctrl.handleDeleteLiveOverlay);

router.get('/videos/list/flowplayer', roleAuthMiddleware([ADMIN]), ctrl.handleListVideo);

router.get('/videos/list', roleAuthMiddleware([ADMIN]), ctrl.handleListAllVideo);

router.post('/videos/create', roleAuthMiddleware([ADMIN]), ctrl.handleCreateVideo);

router.get('/videos/:video_id/get', roleAuthMiddleware([ADMIN, SUBSCRIBER]), ctrl.handleGetVideo);

router.post('/videos/:video_id/update', roleAuthMiddleware([ADMIN]), ctrl.handleUpdateVideo);

router.get('/videos/:video_id/delete', roleAuthMiddleware([ADMIN]), ctrl.handleDeleteVideo);

router.post('/videos/get-signed-url', roleAuthMiddleware([ADMIN]), ctrl.handleGetSignedURL);

router.post('/videos/signed-upload-complete', roleAuthMiddleware([ADMIN]), ctrl.handleCompleteSignedUpload);

router.get('/playlists/list', roleAuthMiddleware([ADMIN]), ctrl.handleListPlaylist);

router.post('/playlists/create', roleAuthMiddleware([ADMIN]), ctrl.handleCreatePlaylist);

router.get('/playlists/:playlist_id/get', roleAuthMiddleware([ADMIN]), ctrl.handleGetPlaylist);

router.post('/playlists/:playlist_id/update', roleAuthMiddleware([ADMIN]), ctrl.handleUpdatePlaylist);

router.get('/playlists/:playlist_id/delete', roleAuthMiddleware([ADMIN]), ctrl.handleDeletePlaylist);

router.post('/videos/:video_id/transcriptions', roleAuthMiddleware([ADMIN]), ctrl.handleCreateTranscription);

router.get('/series/:series_id/get', roleAuthMiddleware([ADMIN, SUBSCRIBER]), ctrl.handleGetSeries);

router.get('/series/list', roleAuthMiddleware([ADMIN]), ctrl.handleGetSeriesList);

router.post('/series/create', roleAuthMiddleware([ADMIN]), ctrl.validate('createOrUpdateSeries'), ctrl.handleCreateSeries);

router.post('/series/:series_id/update', roleAuthMiddleware([ADMIN]), ctrl.validate('createOrUpdateSeries'), ctrl.handleUpdateSeries);

router.post(
    '/series/:series_id/seasons/:season_id?',
    roleAuthMiddleware([ADMIN]),
    ctrl.validate('createOrUpdateSeason'),
    ctrl.handleUpdateOrCreateSeason
);

router.post(
    '/series/:series_id/seasons/:season_id/episodes',
    roleAuthMiddleware([ADMIN]),
    ctrl.validate('addOrRemoveEpisodes'),
    ctrl.handleAddOrRemoveEpisodes
);

router.post(
    '/series/:series_id/trailers',
    roleAuthMiddleware([ADMIN]),
    ctrl.validate('addOrRemoveTrailers'),
    ctrl.handleAddOrRemoveTrailers
);

router.get('/series/:series_id/delete', roleAuthMiddleware([ADMIN]), ctrl.validate('handleDeleteSeries'), ctrl.handleDeleteSeries);

router.get(
    '/series/:series_id/seasons/:season_id/delete',
    roleAuthMiddleware([ADMIN]),
    ctrl.validate('handleDeleteSeason'),
    ctrl.handleDeleteSeason
);

router.post(
    '/series/:series_id/upload-poster',
    roleAuthMiddleware([ADMIN]),
    multer.single('file'),
    ctrl.validate('handleUploadSeriesPoster'),
    ctrl.handleUploadSeriesPoster
);

router.get('/series/:series_id/get-poster', roleAuthMiddleware([ADMIN, SUBSCRIBER]), ctrl.handleGetSeriesPoster);

router.get('/series/videos/list', roleAuthMiddleware([ADMIN]), ctrl.validate('handleGetVideoList'), ctrl.handleGetVideoList);

router.get('/homescreen', roleAuthMiddleware([ADMIN, SUBSCRIBER]), ctrl.handleGetHomeScreenData);

router.post(
    '/videos/:video_id/upload-poster',
    roleAuthMiddleware([ADMIN]),
    multer.single('file'),
    ctrl.validate('handleUploadVideoPoster'),
    ctrl.handleUploadVideoPoster
);

router.get('/videos/:video_id/get-poster', roleAuthMiddleware([ADMIN, SUBSCRIBER]), ctrl.handleGetVideoPoster);

router.get('/media/search/:search_term?', roleAuthMiddleware([ADMIN, SUBSCRIBER]), ctrl.handleMediaSearch);

router.get('/new-n-hot', roleAuthMiddleware([ADMIN, SUBSCRIBER]), ctrl.handleGetNewNHotData);

router.get('/lookups', roleAuthMiddleware([ADMIN, SUBSCRIBER]), ctrl.validate('lookups'), ctrl.handleGetLookupData);

router.get('/trailers', roleAuthMiddleware([ADMIN, SUBSCRIBER]), ctrl.handleGetTrailers);

router.get('/similar-series', roleAuthMiddleware([ADMIN, SUBSCRIBER]), ctrl.validate('handleGetSimilarSeries'), ctrl.handleGetSimilarSeries);

router.post(
    '/series/:series_id/images',
    roleAuthMiddleware([ADMIN]),
    multer.single('file'),
    ctrl.validate('handleUploadSeriesImages'),
    ctrl.handleUploadSeriesImage
);

router.post(
    '/series/:series_id/images/delete',
    roleAuthMiddleware([ADMIN]),
    ctrl.validate('handleDeleteSeriesImage'),
    ctrl.handleDeleteSeriesImage
);

router.post(
    '/series/:series_id/images/bulk-delete',
    roleAuthMiddleware([ADMIN]),
    ctrl.validate('handleBulkDeleteSeriesImage'),
    ctrl.handleBulkDeleteSeriesImage
);

router.post(
    '/videos/:video_id/images',
    roleAuthMiddleware([ADMIN]),
    multer.single('file'),
    ctrl.validate('handleUploadVideoImages'),
    ctrl.handleUploadVideoImages
);

router.post(
    '/videos/:video_id/images/delete',
    roleAuthMiddleware([ADMIN]),
    ctrl.validate('handleDeleteVideoImage'),
    ctrl.handleDeleteVideoImage
);

router.post(
    '/videos/:video_id/images/bulk-delete',
    roleAuthMiddleware([ADMIN]),
    ctrl.validate('handleBulkDeleteVideoImage'),
    ctrl.handleBulkDeleteVideoImage
);

router.post(
    '/videos/:videoId/video-encodings/add',
    roleAuthMiddleware([ADMIN]),
    ctrl.validate('handleAddVideoEncodings'),
    ctrl.handleAddVideoEncodings
);

router.post(
    '/videos/video-encodings-update',
    roleAuthMiddleware([ADMIN]),
    ctrl.validate('handleUpdateVideoEncodings'),
    ctrl.handleUpdateVideoEncoding
);

router.post(
    '/videos/video-encodings-delete',
    roleAuthMiddleware([ADMIN]),
    ctrl.validate('handleDeleteVideoEncodings'),
    ctrl.handleDeleteVideoEncodings
);

router.get(
    '/videos/folders',
    roleAuthMiddleware([ADMIN]),
    ctrl.validate('handleGetVideoFoldersInS3Bucket'),
    ctrl.handleGetVideoFoldersInS3Bucket
);

router.post(
    '/videos/get-presigned-url',
    roleAuthMiddleware([ADMIN]),
    ctrl.validate('handleCreatePresignedUrlForAVideo'),
    ctrl.handleCreatePresignedUrlForAVideo
);

router.get(
    '/videos/hls/list',
    roleAuthMiddleware([ADMIN]),
    ctrl.validate('handleGetHLSFilesInS3Bucket'),
    ctrl.handleGetHLSFilesInS3Bucket
);

router.post(
    '/videos/get-presigned-url/segments',
    roleAuthMiddleware([ADMIN]),
    ctrl.validate('handleCreatePresignedUrlForVideoSegments'),
    ctrl.handleCreatePresignedUrlForVideoSegments
);

router.post(
    '/videos/change-publish-status',
    roleAuthMiddleware([ADMIN]),
    ctrl.validate('handleChangeVideoPublishStatus'),
    ctrl.handleChangeVideoPublishStatus
);

router.post(
    '/series/change-publish-status',
    roleAuthMiddleware([ADMIN]),
    ctrl.validate('handleChangeSeriesPublishStatus'),
    ctrl.handleChangeSeriesPublishStatus
);

module.exports = router;