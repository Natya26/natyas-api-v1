const APIError = require("../errors/APIError");
const _db = require('./../db');

class PlayerId {
    
    static async getPlayerIdList() {
        const data = await _db.getQueryBuilder('user_player_ids')
            .where('active', true)
            .select(_db.knexDB.raw('ARRAY_TO_JSON(ARRAY_AGG("player_id"))  AS playerIds'));
        return data[0].playerids ?? [];
    }

    static async getUserPlayerId(userId) {
        const data = await _db.getQueryBuilder('user_player_ids')
            .where('active', true)
            .where('user_id', userId)
            .select(_db.knexDB.raw('ARRAY_TO_JSON(ARRAY_AGG("player_id"))  AS playerIds'));
    }
}

module.exports = PlayerId;