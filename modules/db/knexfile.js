const localConnection = {
    host: '127.0.0.1',
    port: 5432,
    user: process.env.DB_USER || process.env.USER,
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'navarasa_local',
};

module.exports = {
    development: {
        client: 'pg',
        connection: localConnection,
        migrations: {
            directory: './migrations',
        },
        seeds: {
            directory: './seeds',
        },
    },
    local: {
        client: 'pg',
        connection: localConnection,
        migrations: {
            directory: './migrations',
        },
        seeds: {
            directory: './seeds',
        },
    },
}
