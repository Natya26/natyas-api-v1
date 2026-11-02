const { } = require('objection');
const { Model } = require('..');

class LanguageSeries extends Model {
    static get tableName() {
        return 'language_series';
    }

    static get idColumn() {
        return 'id';
    }

    static get relationMappings() {

        return {
            language: {
                relation: Model.BelongsToOneRelation,
                modelClass: () => require('./Language'),
                join: {
                    from: 'languages.id',
                    to: 'language_series.language_id',
                }
            },
            series: {
                relation: Model.BelongsToOneRelation,
                modelClass: () => require('./Series'),
                join: {
                    from: 'series.id',
                    to: 'language_series.series_id',
                }
            }
        }
    }
}

module.exports = LanguageSeries;