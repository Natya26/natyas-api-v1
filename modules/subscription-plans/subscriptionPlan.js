const { raw } = require('objection');
const db = require('../db');
const models = require('../db/models');

class SubcriptionPlan {
    static async createPlan(payload = {}) {
        try {
            Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);
            if (payload['perks']) payload['perks'] = JSON.stringify(payload['perks']);
            if (payload['currency']) payload['currency'] = payload['currency'].toLowerCase();
            const plan = await db.insertDoc('subscription_plans', payload);
            return plan;
        } catch (e) {
            throw e;
        }
    }

    static async updatePlan(id, payload = {}) {
        try {
            Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);
            if (payload['perks']) payload['perks'] = JSON.stringify(payload['perks']);
            if (payload['currency']) payload['currency'] = payload['currency'].toLowerCase();
            const plan = await db.updateDoc('subscription_plans', id, payload);
            return plan;
        } catch (e) {
            throw e;
        }
    }

    static getPlan(id) {
        return models.SubscriptionPlan.query()
            .withGraphFetched('[subscribers]')
            .modifyGraph('subscribers', query => {
                query.where('subscriptions.active', true)
                    .where('users.active', true)
                    .select(
                        'users.id',
                        'users.user_type',
                        'users.first_name',
                        'users.last_name',
                        'users.photo',
                        'users.phone_code',
                        'users.phone_number',
                        'users.email',
                    )
            })
            .where('subscription_plans.id', id)
            .select(
                'subscription_plans.*',
                models.SubscriptionPlan.relatedQuery('subscribers')
                        .where('subscriptions.active', true)
                        .select(raw('COUNT(DISTINCT("subscribers"."id"))::INTEGER'))
                        .as('subscribers_count')
            )
            .first();
    }

    static getPlanList(limit = null, offset = null, orderBy = []) {
        return models.SubscriptionPlan.query()
            .select(
                'subscription_plans.*',
                models.SubscriptionPlan.relatedQuery('subscribers')
                        .where('subscriptions.active', true)
                        .select(raw('COUNT(DISTINCT("subscribers"."id"))::INTEGER'))
                        .as('subscribers_count')
            )
            .modify(query => {
                if (orderBy.length)
                    query.orderBy(orderBy)
                if (limit)
                    query.limit(limit);
                if (offset)
                    query.offset(offset);
            });
    }

    static async deletePlan(id) {
        return new Promise(async (resolve, reject) => {
            try {
                await db.updateDoc('subscription_plans', id, { 'active': false })
                resolve('SUCCESS');
            } catch (e) {
                return reject(e);
            }
        });
    }
}

module.exports = SubcriptionPlan;