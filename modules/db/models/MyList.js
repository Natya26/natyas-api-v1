const { } = require('objection');
const { Model } = require('..');

class MyList extends Model {
    static get tableName() {
        return 'my_lists';
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
                    from: 'my_lists.series_id',
                    to: 'series.id',
                }
            },
            users: {
                relation: Model.HasManyRelation,
                modelClass: () => require('./User'),
                join: {
                    from: 'my_lists.user_id',
                    to: 'users.id',
                }
            },
        }
    }
}

module.exports = MyList;