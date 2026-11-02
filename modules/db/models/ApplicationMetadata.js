const { } = require('objection');
const { Model } = require('..');

class ApplicationMetadata extends Model {
    static get tableName() {
        return 'application_metadata';
    }

    static get idColumn() {
        return 'id';
    }

    static get relationMappings() {

        return {}
    }
}

module.exports = ApplicationMetadata;