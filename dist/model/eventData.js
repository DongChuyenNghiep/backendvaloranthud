"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataTypes = void 0;
exports.isAuthedData = isAuthedData;
var DataTypes;
(function (DataTypes) {
    DataTypes["SCOREBOARD"] = "scoreboard";
    DataTypes["KILLFEED"] = "killfeed";
    DataTypes["ROSTER"] = "roster";
    DataTypes["MATCH_START"] = "match_start";
    DataTypes["ROUND_INFO"] = "round_info";
    DataTypes["TEAM_IS_ATTACKER"] = "team_is_attacker";
    DataTypes["SCORE"] = "score";
    DataTypes["GAME_MODE"] = "game_mode";
    DataTypes["MAP"] = "map";
    DataTypes["OBSERVING"] = "observing";
    DataTypes["SPIKE_DETONATED"] = "spike_detonated";
    DataTypes["SPIKE_DEFUSED"] = "spike_defused";
    DataTypes["AUTH"] = "authenticate";
    DataTypes["AUX_AUTH"] = "aux_authenticate";
    DataTypes["AUX_ABILITIES"] = "aux_abilities";
    DataTypes["AUX_HEALTH"] = "aux_health";
    DataTypes["AUX_SCOREBOARD"] = "aux_scoreboard";
    DataTypes["AUX_ASTRA_TARGETING"] = "aux_astra_targeting";
    DataTypes["SPIKE_PLANTED"] = "spike_planted";
    DataTypes["TECH_PAUSE"] = "tech_pause";
    DataTypes["LEFT_TIMEOUT"] = "left_timeout";
    DataTypes["RIGHT_TIMEOUT"] = "right_timeout";
})(DataTypes || (exports.DataTypes = DataTypes = {}));
function isAuthedData(data) {
    if (("obsName" in data || "playerId" in data) &&
        ("groupCode" in data || "matchId" in data) &&
        "type" in data &&
        "data" in data) {
        return true;
    }
    return false;
}
