/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('videos', t => {
    t.boolean('is_published_for_web').defaultTo(false);
    t.boolean('is_published_for_app').defaultTo(false);
  }) 
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.alterTable('videos', t => {
      t.dropColumn('is_published_for_web');
      t.dropColumn('is_published_for_app');
    }) 
};
