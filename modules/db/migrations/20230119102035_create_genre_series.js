/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('genre_series', t => {
    t.increments('id').primary();
    t.integer('genre_id').nullable().references('id').inTable('genres').onDelete('CASCADE');
    t.integer('series_id').nullable().references('id').inTable('series').onDelete('CASCADE');
    t.boolean('active').defaultTo(true);
    t.timestamps(true, true);
  });  
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('genre_series');
};
