/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('user_player_ids', t => {
    t.string('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE').alter();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('user_player_ids', t => {
    t.string('user_id').notNullable().alter();
  });
};
