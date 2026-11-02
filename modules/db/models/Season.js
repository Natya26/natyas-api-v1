const { } = require('objection');
const { Model } = require('..');

class Season extends Model {
    static get tableName() {
        return 'seasons';
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
                    from: 'series.id',
                    to: 'season.series_id',
                }
            },
            episodes: {
                relation: Model.HasManyRelation,
                modelClass: () => require('./Video'),
                join: {
                    from: 'seasons.id',
                    to: 'videos.season_id',
                }
            }
        }
    }
}

module.exports = Season;