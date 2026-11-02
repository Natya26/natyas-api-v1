/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('genre_videos', t => {
    t.increments('id').primary();
    t.integer('genre_id').nullable().references('id').inTable('genres').onDelete('CASCADE');
    t.integer('video_id').nullable().references('id').inTable('videos').onDelete('CASCADE');
    t.boolean('active').defaultTo(true);
    t.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('genre_videos');
};
