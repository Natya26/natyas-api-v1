/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('users', t => {
    t.dropColumn('name');
    t.string('email');
    t.string('first_name').defaultTo('');
    t.string('last_name').defaultTo('');
    t.string('gender', 20).defaultTo('');
    t.date('date_of_birth');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('users', t => {
    t.string('name').defaultTo('');
    t.dropColumn('email');
    t.dropColumn('first_name');
    t.dropColumn('last_name');
    t.dropColumn('gender', 20);
    t.dropColumn('date_of_birth');
  });
};
