const { } = require('objection');
const { Model } = require('..');

class GenreVideo extends Model {
    static get tableName() {
        return 'genre_videos';
    }

    static get idColumn() {
        return 'id';
    }

    static get relationMappings() {

        return {
            genre: {
                relation: Model.BelongsToOneRelation,
                modelClass: () => require('./Genre'),
                join: {
                    from: 'genre_videos.genre_id',
                    to: 'genres.id',
                }
            },
            video: {
                relation: Model.BelongsToOneRelation,
                modelClass: () => require('./Video'),
                join: {
                    from: 'genre_videos.video_id',
                    to: 'videos.id',
                }
            }
        }
    }
}

module.exports = GenreVideo;