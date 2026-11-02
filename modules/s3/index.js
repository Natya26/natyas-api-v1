const AWS = require('aws-sdk');
const { resolve } = require('dns');
const fs = require('fs');
// const constants = require('../constants')

// console.log(process.env.AWS_ACCESS_KEY, process.env.AWS_SECRET_KEY);

const s3USEast1 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
});

const s3APSouth1 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    signatureVersion: 'v4',
    region: 'ap-south-1',
});

const bucketName = process.env.S3_IMAGES_BUCKET;
const videoBucketName = process.env.S3_VIDEO_BUCKET;


function uploadImage(file) {
    const { path, filename, s3Key } = file;

    return new Promise((resolve, reject) => {
        fs.readFile(path, (err, data) => {
            if (err) reject(err);
            const params = {
                Bucket: bucketName,
                Key: s3Key,
                Body: data,
                ACL: 'private',
            };
            s3USEast1.upload(params, (s3Err, data) => {
                if (s3Err) {
                    console.log('error : ', s3Err);
                    reject(s3Err);
                }
                else {
                    fs.unlink(path, (err) => {
                        if (err) {
                            console.log('error : ', s3Err);
                            throw err;
                        }
                        resolve(data.Key);
                    });
                }
            });
        });
    });
}

/**
 * 
 * @param {String} filename 
 * @returns {Promise}
 */
function deleteFile(filename) {
    return new Promise((resolve, reject) => {
        const params = {
            Bucket: bucketName,
            Key: filename
        };
        s3USEast1.deleteObject(params, (s3Err, data) => {
            if (s3Err) {
                reject(s3Err);
            }
            console.log(data)
            resolve(data);
        });
    });
}
// async function deletePhotoUrls(data) {
//     return Promise.all(constants.PHOTO_URLS.map(async (item) => {
//         if (data[item]) {
//             return await deleteFile(data[item]);
//         }
//     }))
// }

/**
 * 
 * @param {String} s3Key 
 * @returns {Promise}
 */
const getFile = (s3Key) => {
    return new Promise((resolve, reject) => {
        const params = {
            Bucket: bucketName,
            Key: s3Key
        };
        s3USEast1.getObject(params, (s3Err, data) => {
            if (s3Err) {
                reject(s3Err);
            }
            resolve(data);            
        })
    });
}

const createPresignedUrlWithoutClientForVideo = (s3Key) => {
    return new Promise((resolve, reject) => {
        const params = {
            Bucket: videoBucketName,
            Key: s3Key,
            Expires: 3600,
            ContentType: 'binary/octet-stream'
        };
        s3APSouth1.getSignedUrl('putObject', params, (s3Err, data) => {
            if (s3Err) reject(s3Err);
            resolve(data);
        });
    });
};

const getVideoFolderListInBucket = () => {
    return new Promise((resolve, reject) => {
        const params = {
            Bucket: videoBucketName,
            Delimiter: '/',
            Prefix: ''
        }
        s3APSouth1.listObjectsV2(params, (s3Err, data) => {
            if (s3Err) reject(s3Err);
            resolve(data);
        });
    });
}

const getFilesInVideoBucket = (prefix = '') => {
    return new Promise((resolve, reject) => {
        const params = {
            Bucket: videoBucketName,
            Prefix: prefix,
        }
        s3APSouth1.listObjectsV2(params, (s3Err, data) => {
            if (s3Err) reject(s3Err);
            resolve(data);
        });
    });
}

module.exports = {
    uploadImage,
    deleteFile,
    getFile,
    createPresignedUrlWithoutClientForVideo,
    getVideoFolderListInBucket,
    getFilesInVideoBucket,
};
