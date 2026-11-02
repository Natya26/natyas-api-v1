const { } = require('objection');
const { Model } = require('..');

class Video extends Model {
    static get tableName() {
        return 'videos';
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
                    from: 'videos.series_id',
                    to: 'series.id',
                }
            },
            season: {
                relation: Model.BelongsToOneRelation,
                modelClass: () => require('./Season'),
                join: {
                    from: 'videos.season_id',
                    to: 'seasons.id',
                }
            },
            language: {
                relation: Model.BelongsToOneRelation,
                modelClass: () => require('./Language'),
                join: {
                    from: 'videos.language_id',
                    to: 'languages.id',
                }
            },
            genres: {
                relation: Model.ManyToManyRelation,
                modelClass: () => require('./Genre'),
                join: {
                    from: 'videos.id',
                    to: 'genres.id',
                    through: {
                        from: 'genre_videos.video_id',
                        to: 'genre_videos.genre_id',
                    },
                }
            },
            genreVideos: {
                relation: Model.HasManyRelation,
                modelClass: () => require('./GenreVideo'),
                join: {
                    from: 'videos.id',
                    to: 'genre_videos.video_id',
                }
            },
            category: {
                relation: Model.HasOneThroughRelation,
                modelClass: () => require('./Category'),
                join: {
                    from: 'videos.id',
                    to: 'categories.id',
                    through: {
                        from: 'category_videos.video_id',
                        to: 'category_videos.category_id',
                    },
                }
            },
            categoryVideo: {
                relation: Model.HasOneRelation,
                modelClass: () => require('./CategoryVideo'),
                join: {
                    from: 'videos.id',
                    to: 'category_videos.video_id',
                }
            },
            seriesOfTrailer: {
                relation: Model.HasOneThroughRelation,
                modelClass: () => require('./Series'),
                join: {
                    from: 'videos.id',
                    to: 'series.id',
                    through: {
                        from: 'series_trailers.trailer_id',
                        to: 'series_trailers.series_id',
                    },
                }
            },
            seriesTrailer: {
                relation: Model.HasOneRelation,
                modelClass: () => require('./SeriesTrailer'),
                join: {
                    from: 'videos.id',
                    to: 'series_trailers.trailer_id',
                }
            },
            images: {
                relation: Model.HasManyRelation,
                modelClass: () => require('./VideoImage'),
                join: {
                    from: 'videos.id',
                    to: 'video_images.video_id',
                }
            },
            encodings: {
                relation: Model.HasManyRelation,
                modelClass: () => require('./VideoEncoding'),
                join: {
                    from: 'videos.id',
                    to: 'video_encodings.video_id',
                }
            },
        }
    }
}

module.exports = Video;