const { } = require('objection');
const { Model } = require('..');

class SeriesLike extends Model {
    static get tableName() {
        return 'series_likes';
    }

    static get idColumn() {
        return 'id';
    }

    static get relationMappings() {

        return {
            series: {
                relation: Model.HasManyRelation,
                modelClass: () => require('./Series'),
                join: {
                    from: 'series_likes.series_id',
                    to: 'series.id',
                }
            },
            users: {
                relation: Model.HasManyRelation,
                modelClass: () => require('./User'),
                join: {
                    from: 'series_likes.user_id',
                    to: 'users.id',
                }
            },
        }
    }
}

module.exports = SeriesLike;