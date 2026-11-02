/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema
    .alterTable('authentication', t => {
        t.integer('retryCount').defaultTo(0)
        t.timestamp('lastOtpTimeStamp')
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema
        .alterTable('authentication', t => {
            t.dropColumn('retryCount')
            t.dropColumn('lastOtpTimeStamp')
        })
};
