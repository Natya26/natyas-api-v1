/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('genres', t => {
    t.increments('id').primary();
    t.string('name').notNullable();
    t.text('description').nullable();
    t.boolean('active').notNullable().defaultTo(true);
    t.timestamps(true, true);
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('genres');
};
