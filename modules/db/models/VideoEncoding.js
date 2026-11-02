const { } = require('objection');
const { Model } = require('..');

class VideoEncoding extends Model {
    static get tableName() {
        return 'video_encodings';
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
                    from: 'video_encodings.video_id',
                    to: 'videos.id',
                }
            },
        }
    }
}

module.exports = VideoEncoding;