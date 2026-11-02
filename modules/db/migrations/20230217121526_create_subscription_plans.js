/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('subscription_plans', t => {
    t.increments('id').primary();
    t.string('name');
    t.double('cost', 8, 2);
    t.string('currency');
    t.integer('validity').defaultTo(0);
    t.string('validity_unit').defaultTo('DAY');
    t.boolean('active').defaultTo(true);
    t.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('subscription_plans');
};
