const { } = require('objection');
const { Model } = require('..');

class SubscriptionPlan extends Model {
    static get tableName() {
        return 'subscription_plans';
    }

    static get idColumn() {
        return 'id';
    }

    static get relationMappings() {

        return {
            subscribers: {
                relation: Model.ManyToManyRelation,
                modelClass: require('./User'),
                join: {
                    from: 'subscription_plans.id',
                    to: 'users.id',
                    through: {
                        from: 'subscriptions.subscription_plan_id',
                        to: 'subscriptions.user_id',
                    }
                }
            },
            subscriptions: {
                relation: Model.HasManyRelation,
                modelClass: require('./Subscription'),
                join: {
                    from: 'subscription_plans.id',
                    to: 'subscriptions.subscription_plan_id',
                },
            },
            payments: {
                relation: Model.HasManyRelation,
                modelClass: require('./Payment'),
                join: {
                    from: 'subscription_plans.id',
                    to: 'payments.subscription_plan_id',
                }
            },
            subscribersLog: {
                relation: Model.ManyToManyRelation,
                modelClass: require('./User'),
                join: {
                    from: 'subscription_plans.id',
                    to: 'users.id',
                    through: {
                        from: 'payments.subscription_plan_id',
                        to: 'payments.user_id',
                    },
                }
            }
        }
    }
}

module.exports = SubscriptionPlan;