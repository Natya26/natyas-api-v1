const { } = require('objection');
const { Model } = require('..');

class Series extends Model {
    static get tableName() {
        return 'series';
    }

    static get idColumn() {
        return 'id';
    }

    static get relationMappings() {

        return {
            seasons: {
                relation: Model.HasManyRelation,
                modelClass: () => require('./Season'),
                join: {
                    from: 'series.id',
                    to: 'seasons.series_id',
                }
            },
            episodes: {
                relation: Model.HasManyRelation,
                modelClass: () => require('./Video'),
                join: {
                    from: 'series.id',
                    to: 'videos.series_id',
                }
            },
            languages: {
                relation: Model.ManyToManyRelation,
                modelClass: () => require('./Language'),
                join: {
                    from: 'series.id',
                    to: 'languages.id',
                    through: {
                        from: 'language_series.series_id',
                        to: 'language_series.language_id',
                    }
                }
            },
            languageSeries: {
                relation: Model.HasManyRelation,
                modelClass: () => require('./LanguageSeries'),
                join: {
                    from: 'series.id',
                    to: 'videos.series_id',
                }
            },
            genres: {
                relation: Model.ManyToManyRelation,
                modelClass: () => require('./Genre'),
                join: {
                    from: 'series.id',
                    to: 'genres.id',
                    through: {
                        from: 'genre_series.series_id',
                        to: 'genre_series.genre_id',
                    }
                }
            },
            genreSeries: {
                relation: Model.HasManyRelation,
                modelClass: () => require('./GenreSeries'),
                join: {
                    from: 'series.id',
                    to: 'genre_series.series_id',
                }
            },
            trailers: {
                relation: Model.ManyToManyRelation,
                modelClass: () => require('./Video'),
                join: {
                    from: 'series.id',
                    to: 'videos.id',
                    through: {
                        from: 'series_trailers.series_id',
                        to: 'series_trailers.trailer_id',
                    }
                }
            },
            seriesTrailers: {
                relation: Model.HasManyRelation,
                modelClass: () => require('./SeriesTrailer'),
                join: {
                    from: 'series.id',
                    to: 'series_trailers.series_id',
                }
            },
            inMyListOf: {
                relation: Model.ManyToManyRelation,
                modelClass: () => require('./User'),
                join: {
                    from: 'series.id',
                    to: 'users.id',
                    through: {
                        from: 'my_lists.series_id',
                        to: 'my_lists.user_id',
                    }
                }
            },
            myListRows: {
                relation: Model.HasManyRelation,
                modelClass: () => require('./MyList'),
                join: {
                    from: 'series.id',
                    to: 'my_lists.series_id',
                }
            },
            likedBy: {
                relation: Model.ManyToManyRelation,
                modelClass: () => require('./User'),
                join: {
                    from: 'series.id',
                    to: 'users.id',
                    through: {
                        from: 'series_likes.series_id',
                        to: 'series_likes.user_id',
                    }
                }
            },
            seriesLikesRows: {
                relation: Model.HasManyRelation,
                modelClass: () => require('./SeriesLike'),
                join: {
                    from: 'series.id',
                    to: 'series_likes.series_id',
                }
            },
            images: {
                relation: Model.HasManyRelation,
                modelClass: () => require('./SeriesImage'),
                join: {
                    from: 'series.id',
                    to: 'series_images.series_id',
                }
            },
        }
    }
}

module.exports = Series;