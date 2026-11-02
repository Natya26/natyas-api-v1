/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('series_images', t => {
    t.increments('id').primary();
    t.integer('series_id').notNullable().references('id').inTable('series').onDelete('CASCADE');
    t.string('image').notNullable();
    t.string('tag').notNullable();
    t.boolean('active').defaultTo(true);
    t.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('series_images');
};
