/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('users', t => {
        t.string('id').primary().unique()
        t.string('authType').notNullable()
        t.string('authId').notNullable()
        t.string('type').notNullable()
        t.string('photo')
        t.boolean('active').defaultTo(false)
        t.datetime('lastLogin').defaultTo(knex.fn.now())
        t.boolean('admin').defaultTo(false)
        t.timestamps(true, true)
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('users')
};
