const APIError = require('./../errors/APIError');
const db = require('./../db');
const models = require('./../db/models');

class Subscription {    

    static async createSubscription(payload) {
        return new Promise(async (resolve, reject) => {
            try {
                Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);
                const subscription = await db.insertDoc('subscriptions', payload);
                return resolve(subscription);
            } catch (e) {
                return reject(e);
            }
        });
    }

    static async updateSubscription(id, payload) {
        return new Promise(async (resolve, reject) => {
            try {
                Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);
                const subscription = await db.updateDoc('subscriptions', id, payload);
                return resolve(subscription);
            } catch (e) {
                return reject(e);
            }
        });
    }

    static getSubscription(id) {
        return models.Subscription.query()
            .withGraphFetched('[user, subscriptionPlan]')
            .modify(query => {
                if (id) query.where('subscriptions.id', id);
            })
            .select('subscriptions.*')
            .first();
    }

    static getSubscriptionList(limit = null, offset = null, orderBy = []) {
        return models.Subscription.query()
            .select('subscriptions.*')
            .modify(query => {
                if (orderBy.length)
                    query.orderBy(orderBy)
                if (limit)
                    query.limit(limit);
                if (offset)
                    query.offset(offset);
            });
    }
}

module.exports = Subscription;