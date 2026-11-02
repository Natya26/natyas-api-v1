const { } = require('objection');
const { Model } = require('..');

class VideoImage extends Model {
    static get tableName() { 
        return 'video_images';
    }

    static get idColumn() {
        return 'id';
    }

    static get relationMappings() {

        return {
            video: {
                relation: Model.BelongsToOneRelation,
                modelClass: () => require('./Video'),
                join: {
                    from: 'video_images.video_id',
                    to: 'videos.id',
                }
            },
        }
    }
}

module.exports = VideoImage;