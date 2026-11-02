/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('subscriptions', t => {
    t.increments('id').primary();
    t.integer('subscription_plan_id').notNullable().references('id').inTable('subscription_plans').onDelete('CASCADE');
    t.string('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.timestamp('valid_from');
    t.timestamp('valid_till');
    t.boolean('active').defaultTo(true);
    t.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('subscriptions');
};
