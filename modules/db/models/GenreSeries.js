const { } = require('objection');
const { Model } = require('..');

class GenreSeries extends Model {
    static get tableName() {
        return 'genre_series';
    }

    static get idColumn() {
        return 'id';
    }

    static get relationMappings() {

        return {
            series: {
                relation: Model.BelongsToOneRelation,
                modelClass: () => require('./Series'),
                join: {
                    from: 'genre_series.series_id',
                    to: 'series.id',
                }
            },
            genres: {
                relation: Model.BelongsToOneRelation,
                modelClass: () => require('./Genre'),
                join: {
                    from: 'genre_series.genre_id',
                    to: 'genres.id',
                }
            }
        }
    }
}

module.exports = GenreSeries;