const { } = require('objection');
const { Model } = require('..');

class Authentication extends Model {
    static get tableName() {
        return 'authentication';
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
                    from: 'users.id',
                    to: 'authentication.userId',
                }
            }
        }
    }
}

module.exports = Authentication;