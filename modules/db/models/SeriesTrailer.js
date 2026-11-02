const { } = require('objection');
const { Model } = require('..');

class SeriesTrailer extends Model {
    static get tableName() {
        return 'series_trailers';
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
                    from: 'series_trailers.series_id',
                    to: 'series.id',
                }
            },
            trailer: {
                relation: Model.BelongsToOneRelation,
                modelClass: () => require('./Video'),
                join: {
                    from: 'series_trailers.trailer_id',
                    to: 'videos.id',
                }
            }
        }
    }
}

module.exports = SeriesTrailer;