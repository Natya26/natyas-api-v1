const { } = require('objection');
const { Model } = require('..');

class SeriesImage extends Model {
    static get tableName() { 
        return 'series_images';
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
                    from: 'series_images.series_id',
                    to: 'series.id',
                }
            },
        }
    }
}

module.exports = SeriesImage;