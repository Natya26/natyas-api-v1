/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('application_metadata', t => {
    t.increments('id').primary();
    t.string('merchant_upi_id');
    t.integer('apk_version_code');
    t.string('apk_version_name');
    t.string('apk_is_mandatory').defaultTo(true);
    t.boolean('active').defaultTo(true);
    t.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('application_metadata');
};
