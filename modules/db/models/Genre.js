const { } = require('objection');
const { Model } = require('..');

class Genre extends Model {
    static get tableName() {
        return 'genres';
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
                    from: 'genres.id',
                    to: 'series.id',
                    through: {
                        from: 'genre_series.genre_id',
                        to: 'genre_series.series_id',
                    }
                }
            },
            genreSeries: {
                relation: Model.HasManyRelation,
                modelClass: () => require('./GenreSeries'),
                join: {
                    from: 'genres.id',
                    to: 'genre_series.genre_id',
                }
            },
            videos: {
                relation: Model.ManyToManyRelation,
                modelClass: () => require('./Video'),
                join: {
                    from: 'genres.id',
                    to: 'videos.id',
                    through: {
                        from: 'genre_videos.genre_id',
                        to: 'genre_videos.video_id',
                    }
                }
            },
            genreVideos: {
                relation: Model.HasManyRelation,
                modelClass: () => require('./GenreVideo'),
                join: {
                    from: 'genres.id',
                    to: 'genre_videos.genre_id',
                }
            }
        }
    }
}

module.exports = Genre;