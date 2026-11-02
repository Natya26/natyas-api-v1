/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('series', t => {
        t.increments('id').primary();
        t.string('name').defaultTo('');
        t.text('description').defaultTo('');
        t.string('poster').defaultTo('');
        t.boolean('active').defaultTo(true);
        t.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('series');
};
