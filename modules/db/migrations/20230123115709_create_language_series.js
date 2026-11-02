/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('language_series', t => {
    t.increments('id').primary();
    t.integer('language_id').notNullable().references('id').inTable('languages').onDelete('CASCADE');
    t.integer('series_id').notNullable().references('id').inTable('series').onDelete('CASCADE');
    t.boolean('active').defaultTo(true);
    t.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('language_series');
};
