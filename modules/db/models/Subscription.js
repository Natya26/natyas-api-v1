const { } = require('objection');
const { Model } = require('..');

class Subscription extends Model {
    static get tableName() {
        return 'subscriptions';
    }

    static get idColumn() {
        return 'id';
    }

    static get relationMappings() {

        return {
            user: {
                relation: Model.BelongsToOneRelation,
                modelClass: require('./User'),
                join: {
                    from: 'subscriptions.user_id',
                    to: 'users.id',
                }
            },
            subscriptionPlan: {
                relation: Model.BelongsToOneRelation,
                modelClass: require('./SubscriptionPlan'),
                join: {
                    from: 'subscriptions.subscription_plan_id',
                    to: 'subscription_plans.id',
                }
            },
        }
    }
}

module.exports = Subscription;