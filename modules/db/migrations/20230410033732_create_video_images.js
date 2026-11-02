/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('video_images', t => {
    t.increments('id').primary();
    t.integer('video_id').notNullable().references('id').inTable('videos').onDelete('CASCADE');
    t.string('image').notNullable();
    t.string('tag').notNullable();
    t.boolean('active').defaultTo(true);
    t.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('video_images');
};
