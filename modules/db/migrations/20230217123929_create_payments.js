/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('payments', t => {
    t.increments('id').primary();
    t.string('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.integer('subscription_plan_id').notNullable().references('id').inTable('subscription_plans').onDelete('CASCADE');
    t.string('payment_intent_id').notNullable();
    t.double('paid_amount', 8, 2).notNullable();
    t.string('payment_status').defaultTo('INITIATED');//'INITIATED', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELED' 
    t.boolean('active').defaultTo(true);
    t.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('payments');
};
