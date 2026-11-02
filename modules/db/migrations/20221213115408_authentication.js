exports.up = function (knex) {
    return knex.schema.createTable('authentication', t => {
        t.increments('id').primary()
        t.string('userId').notNullable().references('id').inTable('users').onDelete('CASCADE')
        t.string('password').notNullable()
        t.string('resetToken')
        t.timestamp('resetTokenExpiry')
        t.boolean('active').notNullable().defaultTo(true)
        t.timestamps(true, true)
    })
}

exports.down = function (knex) {
    return knex.schema.dropTable('authentication')
}