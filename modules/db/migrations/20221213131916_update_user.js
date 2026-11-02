/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.alterTable('users', t => {
        t.string('user_type').defaultTo('')
        t.string('phone_number').defaultTo('')
        t.string('country_code').defaultTo('')
        t.boolean('email_verified').defaultTo(false)
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.alterTable('users', t => {
        t.dropColumn('user_type')
        t.dropColumn('phone_number')
        t.dropColumn('email_verified')
    })
};
