/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('videos', t => {
    t.unique('fwp_id', { indexName: 'videos_fwp_id_unique' });
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('videos', t => {
    t.dropUnique('fwp_id', 'videos_fwp_id_unique');
  });  
};
