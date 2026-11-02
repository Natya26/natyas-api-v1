const APIError = require('../errors/APIError');
const { uploadImage } = require('../s3');
const _db = require('./../db');
const models = require('./../db/models');

class ApplicationMetadata {

    tableName = 'application_metadata';
    rowId = 1;
    getApkInfo = ({ apk_version_code, apk_version_name, apk_is_mandatory = true } ) => ({
        packageName: 'com.world.navarasa',
        versionCode: apk_version_code,
        versionName: apk_version_name,
        isMandatory: apk_is_mandatory,
    });

    getMerchantUPIInfo = ({ merchant_upi_id }) => ({ upiId: merchant_upi_id });

    find(type = 'all') {
        const query = models.ApplicationMetadata.query();
        
        if (type == 'all')
            query.select('*');
        else if (type == 'merchant_upi_id')
            query.select('id', 'merchant_upi_id');
        else if (type == 'android_info')
            query.select('id', 'apk_version_code', 'apk_version_name', 'apk_is_mandatory');
        else if (type == 'apk_s3_key')
            query.select('id', 'apk_s3_key');
        
        return query;
    }

    async addApplicationMetadata() {
        return new Promise(async (resolve, reject) => {
            try {
                const payload = {
                    id: this.rowId,
                    active: true
                };
                await _db.insertDoc(this.tableName, payload);
                return resolve();
            } catch (e) {
                return reject(e);
            }
        });
    }

    async getApplicationMetadata() {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await _db.getQueryBuilder(this.tableName)
                    .where('id', this.rowId)
                    .first();
                return resolve(result);
            } catch (e) {
                return reject(e);
            }
        });
    }

    async addMerchantUPIId({ upiId }) {
        return new Promise(async (resolve, reject) => {
            try {
                if (!upiId) throw new APIError(400, 'INVALID_UPI_ID');

                const applicationMetadata = await this.getApplicationMetadata();
                if (!applicationMetadata) await this.addApplicationMetadata();
                
                const payload = { merchant_upi_id: upiId };
                await _db.updateDoc(this.tableName, this.rowId, payload);
                const result = await this.find('merchant_upi_id').where('id', this.rowId).first();
                
                return resolve(this.getMerchantUPIInfo(result));
            } catch (e) {
                return reject(e);
            }
        });
    }

    async addApkInfo({ versionCode, versionName, isMandatory = true }) {
        return new Promise(async (resolve, reject) => {
            try {
                const applicationMetadata = await this.getApplicationMetadata();
                if (!applicationMetadata) await this.addApplicationMetadata();
                const payload = {
                    apk_version_code: versionCode,
                    apk_version_name: versionName,
                    apk_is_mandatory: isMandatory
                };
                await _db.updateDoc(this.tableName, this.rowId, payload);
                const info = await this.find('android_info').where('id', this.rowId).first();
                const result = this.getApkInfo(info);
                return resolve(result);
            } catch (e) {
                return reject(e);
            }
        });
    }

    async getApplicationVersion({ platform = 'android' }) {
        return new Promise(async (resolve, reject) => {
            let info = undefined;
            let result = undefined;
            try {
                if (!['android', 'ios'].includes(platform)) throw new APIError(400, 'INVALID_PLATFORM');

                if (platform == 'android') {
                    info = await this.find('android_info').where('id', this.rowId).first();
                    result = this.getApkInfo(info);
                }
                else if (platform == 'ios')
                    info = await this.find('ios_info').where('id', this.rowId).first();


                return resolve(result);
            } catch (e) {
                return reject(e);
            }
        });
    }

    async getMerchantUPIId() {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await this.find('merchant_upi_id').where('id', this.rowId).first();
                if (!result) throw new APIError(500, 'INFO_NOT_FOUND');
                return resolve(this.getMerchantUPIInfo(result));
            } catch (e) {
                return reject(e);
            }
        });
    }

    async uploadApkToS3(file) {
        return new Promise(async (resolve, reject) => {
            try {
                const applicationMetadata = await this.getApplicationMetadata();
                if (!applicationMetadata) await this.addApplicationMetadata();

                file.s3Key = `android/apk/${file.filename}`;
                const key = await uploadImage(file);
                await _db.updateDoc(this.tableName, this.rowId, { apk_s3_key: key });
                
                return resolve();
            } catch (e) {
                return reject(e);
            }
        });
    }

    async getApkS3Key() {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await this.find('apk_s3_key').where('id', this.rowId).first();
                return resolve(result);
            } catch (error) {
                reject(e);
            }
        });
    }
}

module.exports = ApplicationMetadata;