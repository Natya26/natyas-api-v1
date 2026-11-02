/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('videos', t => {
    t.integer('language_id').nullable().references('id').inTable('languages').onDelete('CASCADE');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('videos', t => {
    t.dropForeign('videos_language_id_foreign');
    t.dropColumn('language_id');
  });
};
