const { } = require('objection');
const { Model } = require('..');

class CategoryVideo extends Model {
    static get tableName() {
        return 'category_videos';
    }

    static get idColumn() {
        return 'id';
    }

    static get relationMappings() {

        return {
            category: {
                relation: Model.BelongsToOneRelation,
                modelClass: () => require('./Category'),
                join: {
                    from: 'category_videos.category_id',
                    to: 'categories.id',
                }
            },
            video: {
                relation: Model.BelongsToOneRelation,
                modelClass: () => require('./Video'),
                join: {
                    from: 'category_videos.video_id',
                    to: 'videos.id',
                }
            }
        }
    }
}

module.exports = CategoryVideo;