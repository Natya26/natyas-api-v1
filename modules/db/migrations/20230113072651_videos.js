/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('videos', t => {
    t.increments('id').primary();
    t.string('fwp_id').notNullable().unique();
    t.string('name').notNullable();
    t.string('description').defaultTo('');
    t.string('poster').defaultTo('');
    t.integer('duration').defaultTo(0);
    t.boolean('active').defaultTo(true);
    t.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('videos');
};
