/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('videos', t => {
    t.integer('series_id').nullable().references('id').inTable('series').onDelete('CASCADE');
    t.integer('season_id').nullable().references('id').inTable('seasons').onDelete('CASCADE');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('videos', t => {
    t.dropForeign('series_id');
    t.dropForeign('season_id');
    t.dropColumn('series_id');
    t.dropColumn('season_id');
  });
};
