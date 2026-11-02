const { } = require('objection');
const { Model } = require('..');

class Category extends Model {
    static get tableName() {
        return 'categories';
    }

    static get idColumn() {
        return 'id';
    }

    static get relationMappings() {

        return {
            videos: {
                relation: Model.ManyToManyRelation,
                modelClass: () => require('./Video'),
                join: {
                    from: 'categories.id',
                    to: 'videos.id',
                    through: {
                        from: 'category_videos.category_id',
                        from: 'category_videos.video_id',
                    },
                }
            },
            categoryVideos: {
                relation: Model.HasManyRelation,
                modelClass: () => require('./CategoryVideo'),
                join: {
                    from: 'categories.id',
                    to: 'category_videos.category_id',
                }
            }
        }
    }
}

module.exports = Category;