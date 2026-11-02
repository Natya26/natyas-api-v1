const { } = require('objection');
const { Model } = require('..');

class Language extends Model {
    static get tableName() {
        return 'languages';
    }

    static get idColumn() {
        return 'id';
    }

    static get relationMappings() {

        return {
            series: {
                relation: Model.ManyToManyRelation,
                modelClass: () => require('./Series'),
                join: {
                    from: 'languages.id',
                    to: 'series.id',
                    through: {
                        from: 'language_series.language_id',
                        to: 'language_series.series_id',
                    }
                }
            },
            videos: {
                relation: Model.HasManyRelation,
                modelClass: () => require('./Video'),
                join: {
                    from: 'languages.id',
                    to: 'videos.languages_id',
                }
            },
            languageSeries: {
                relation: Model.HasManyRelation,
                modelClass: () => require('./LanguageSeries'),
                join: {
                    from: 'languages.id',
                    to: 'language_series.languages_id',
                }
            }
        }
    }
}

module.exports = Language;