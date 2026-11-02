const { } = require('objection');
const { Model } = require('..');

class Payment extends Model {
    static get tableName() {
        return 'payments';
    }

    static get idColumn() {
        return 'id';
    }

    static get relationMappings() {

        return {
            user: {
                relation: Model.BelongsToOneRelation,
                modelClass: () => require('./User'),
                join: {
                    from: 'payments.user_id',
                    to: 'users.id',
                }
            },
            subscriptionPlan: {
                relation: Model.BelongsToOneRelation,
                modelClass: () => require('./SubscriptionPlan'),
                join: {
                    from: 'payments.subscription_plan_id',
                    to: 'subscription_plans.id',
                }
            },
        }
    }
}

module.exports = Payment;