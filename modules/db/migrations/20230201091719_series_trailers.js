/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('series_trailers', t => {
    t.increments('id').primary();
    t.integer('series_id').notNullable().references('id').inTable('series').onDelete('CASCADE');
    t.integer('trailer_id').notNullable().references('id').inTable('videos').onDelete('CASCADE');
    t.boolean('active').defaultTo(true);
    t.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('series_trailers');
};
