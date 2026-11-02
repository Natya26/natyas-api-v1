const db = require('../db');
const dbUtils = require('../db/utils');


class DB {
    static async saveUser(user) {
        const userId = await db('users').insert(user).returning('id');
        console.log(userId);
        return userId;
    }

    static async saveAuthentication(userId, password) {
        const row = {
            userId,
            password,
            active: true
        };
        const id = await db('authentication').insert(row).returning('id');
        return id;
    }
}

module.exports = DB;