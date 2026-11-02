/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('payment_tokens', t => {
    t.increments('id').primary();
    t.string('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.string('token').notNullable();
    t.boolean('active').defaultTo(true);
    t.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('payment_tokens');
};
