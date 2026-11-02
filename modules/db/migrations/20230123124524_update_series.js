/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('series', t => {
    t.boolean('featured').defaultTo(false);
    t.string('director').defaultTo('');
    t.json('casts').defaultTo('[]');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('series', t => {
    t.dropColumns(['casts', 'director', 'featured']);
  });
};
