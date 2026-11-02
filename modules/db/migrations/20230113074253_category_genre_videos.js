/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('category_genre_videos', t => {
    t.increments('id').primary();
    t.integer('category_id').nullable().references('id').inTable('categories').onDelete('CASCADE');
    t.integer('genre_id').nullable().references('id').inTable('genres').onDelete('CASCADE');
    t.integer('video_id').notNullable().references('id').inTable('videos').onDelete('CASCADE');
    t.boolean('active').defaultTo(true);
    t.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('category_genre_videos');
};
    