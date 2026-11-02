const { } = require('objection');
const { Model } = require('..');

class Notification extends Model {
    static get tableName() {
        return 'notifications';
    }

    static get idColumn() {
        return 'id';
    }

    static get relationMappings() {

        return {}
    } 
}

module.exports = Notification;