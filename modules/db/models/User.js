const { } = require('objection');
const { Model } = require('..');

class User extends Model {
    static get tableName() {
        return 'users';
    }

    static get idColumn() {
        return 'id';
    }

    static get relationMappings() {

        return {
            authentication: {
                relation: Model.HasOneRelation,
                modelClass: () => require('./Authentication'),
                join: {
                    from: 'users.id',
                    to: 'authentication.userId'
                }
            },
            myList: {
                relation: Model.ManyToManyRelation,
                modelClass: require('./Series'),
                join: {
                    from: 'users.id',
                    to: 'series.id',
                    through: {
                        from: 'my_lists.user_id',
                        to: 'my_lists.series_id',
                    },
                },
            },
            myListRows: {
                relation: Model.HasManyRelation,
                modelClass: require('./MyList'),
                join: {
                    from: 'users.id',
                    to: 'my_lists.user_id',
                },
            },
            likedSeries: {
                relation: Model.ManyToManyRelation,
                modelClass: require('./Series'),
                join: {
                    from: 'users.id',
                    to: 'series.id',
                    through: {
                        from: 'series_likes.user_id',
                        to: 'series_likes.series_id',
                    },
                },
            },
            seriesLikesRows: {
                relation: Model.HasManyRelation,
                modelClass: require('./SeriesLike'),
                join: {
                    from: 'users.id',
                    to: 'series_likes.user_id',
                },
            },
            subscriptionPlan: {
                relation: Model.HasOneThroughRelation,
                modelClass: require('./SubscriptionPlan'),
                join: {
                    from: 'users.id',
                    to: 'subscription_plans.id',
                    through: {
                        from: 'subscriptions.user_id',
                        to: 'subscriptions.subscription_plan_id',
                    }
                },
            },
            subscription: {
                relation: Model.HasOneRelation,
                modelClass: require('./Subscription'),
                join: {
                    from: 'users.id',
                    to: 'subscriptions.user_id',
                },
            },
            payments: {
                relation: Model.HasManyRelation,
                modelClass: require('./Payment'),
                join: {
                    from: 'users.id',                    
                    to: 'payments.user_id',
                }
            },
            subscriptionHistory: {
                relation: Model.ManyToManyRelation,
                modelClass: require('./SubscriptionPlan'),
                join: {
                    from: 'users.id',
                    to: 'subscription_plans.id',
                    through: {
                        from: 'payments.user_id',
                        to: 'payments.subscription_plan_id',
                    },
                }
            }
        }
    } 
}

module.exports = User;