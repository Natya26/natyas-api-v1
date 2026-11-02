/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('application_metadata', t => {
    t.boolean('apk_is_mandatory').defaultTo(true).alter();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('application_metadata', t => {
    t.string('apk_is_mandatory').defaultTo(true).alter();
  });
};
