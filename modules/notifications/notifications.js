const axios = require('axios');
const { EventEmitter } = require('./../events/event');
const PlayerIdClient = require('./../notifications/playerId');
const _db = require('./../db');
const APP_ID = process.env.ONESIGNAL_APP_ID;
const s3Assets = require('./../s3/constants');
class Notification {

    static notificationConfig = () => require('./../config/notification.config');

    static serverConfig = () => require('./../config/server.config');

    static apiLimit = () => 2000;

    static async removeEmptyString(arr = []) {
        let newArray = arr;
        if (arr.length > 0) newArray = arr.filter(x => (x.length > 0 && !['null', null].includes(x)))
        return newArray;
    }

    static sendNotification(data, dbPayload, { createNotification = true }) {

        const headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
        };
        const options = {
          method: 'POST',
          url: 'https://onesignal.com/api/v1/notifications',
          headers,
          data,
        };
        
        axios
            .request(options)
            .then(async function (res) {
                if (!res?.data || !res?.data?.id) return;

                dbPayload.notification_id = res.data.id;
                
                if (createNotification) await _db.insertDoc('notifications', dbPayload);
                
                console.log("Notified");
            })
            .catch(function (e) {
                console.log("ERROR:", e);
            });
    }

    static events() {
        EventEmitter.on('TEST', async data => {
            
            const payload = {
                type: data.type,
                notification_id: '',
                details: {
                    contents: data.contents
                },
                active: true,
            };
            // const playerIds = await PlayerIdClient.getPlayerIdList();
            this.sendNotification({
                app_id             : APP_ID,
                headings           : this.headings[data.type],
                contents           : data.contents,
                included_segments  : ['Subscribed Users'],
                excluded_segments  : [],
                // include_player_ids: await this.removeEmptyString(playerIds),
                android_channel_id : this.notificationConfig().androidChannelId,
                large_icon: this.serverConfig().baseUrl + s3Assets.images.androidOneSignalLargeIconOrange.key
            }, payload);
        });

        EventEmitter.on('NEW_SERIES', async data => {

            const headings = {
                en: this.headings[data.type]?.en?.replace('seriesName', data.series.name)
            };
            const payload = {
                type            : data.type,
                notification_id : '',
                active          : true,
                details         : {
                    headings,
                    series_id   : data.series.id,
                    contents    : { en: headings.en },
                },
            };
            
            // const playerIds        = await PlayerIdClient.getPlayerIdList();
            // let createNotification = true;
            
            // for (let i = 0; i < playerIds.length; i +=  this.apiLimit()) {
                
            this.sendNotification({
                headings,
                app_id             : APP_ID,
                contents           : { en: headings.en },
                included_segments  : ['Subscribed Users'],
                excluded_segments  : [],
                // include_player_ids : await this.removeEmptyString(playerIds.slice(i, i + this.apiLimit())),
                android_channel_id : this.notificationConfig().androidChannelId,
                large_icon         : this.serverConfig().baseUrl + s3Assets.images.androidOneSignalLargeIconOrange.key
            }, payload);
            //     { createNotification }
            //     );

            //     if (createNotification) createNotification = false;
            // }
        });
        
        EventEmitter.on('NEW_EPISODES', async data => {
            const headings = {
                en: this.headings[data.type]?.en?.replace('seriesName', data.series.name)
            };
            const payload = {
                type            : data.type,
                notification_id : '',
                details         : {
                    headings,
                    series_id   : data.series.id,
                    poster      : data.series.poster,
                    contents    : { en: headings.en }
                },
                active          : true,
            };
            // const playerIds = await PlayerIdClient.getPlayerIdList();
            // let createNotification = true;
            
            // for (let i = 0; i < playerIds.length; i +=  this.apiLimit()) {
                
            this.sendNotification({
                headings,
                app_id             : APP_ID,
                contents           : { en: headings.en },
                included_segments  : ['Subscribed Users'],
                // include_player_ids : await this.removeEmptyString(playerIds),
                android_channel_id : this.notificationConfig().androidChannelId,
                large_icon         : this.serverConfig().baseUrl + s3Assets.images.androidOneSignalLargeIconOrange.key,
                big_picture: this.serverConfig().baseUrl + data.poster
            }, payload);
            //     { createNotification }
            //     );

            //     if (createNotification) createNotification = false;
            // }
        });
    }

    static async createNotification(payload = {}) {
        return new Promise(async (resolve, reject) => {
            try {
                Object.keys(payload).forEach(key => payload[key] == undefined && delete payload[key]);
                const notification = await _db.insertDoc('notifications', payload);
                return resolve(notification);
            } catch (e) {
                return reject(e);
            }
        });
    }

    static getNotification() {
        try {
            return _db.getQueryBuilder('notifications')
                .select('id', 'notification_id', 'type', 'details');
        } catch (e) {
            throw e;
        }
    }

    static async modifyNotification(id, payload = {}) {
        return new Promise(async (resolve, reject) => {
            try {
                Object.keys(payload).forEach(key => !payload[key] && delete payload[key]);
                const notification = await _db.updateDoc('notifications', id, payload);
                return resolve(notification);
            } catch (e) {
                return reject(e);
            }
        });
    }
    
    static headings = {
        'TEST': { en: 'Notification from Navarasa' },
        'NEW_SERIES': { en: 'New series out: seriesName' },
        'NEW_EPISODES': { en: 'New episodes out for series seriesName' },
    };
}

module.exports = Notification;