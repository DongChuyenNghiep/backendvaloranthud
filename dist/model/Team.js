"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Team = void 0;
const Player_1 = require("./Player");
const eventData_1 = require("./eventData");
const Logging_1 = __importDefault(require("../util/Logging"));
const ValorantInternalTranslator_1 = require("../util/ValorantInternalTranslator");
const Log = (0, Logging_1.default)("Team").level(1);
class Team {
    teamName;
    teamTricode;
    teamUrl = "";
    ingameTeamId = 0;
    isAttacking = false;
    hasHandledTeam = false;
    roundsWon = 0;
    spentThisRound = 0;
    roundRecord = [];
    players = [];
    playerCount = 0;
    hasDuplicateAgents = false;
    constructor(team) {
        this.teamName = team.name;
        this.teamTricode = team.tricode;
        this.teamUrl = team.url;
        this.isAttacking = team.attackStart;
        this.ingameTeamId = team.attackStart ? 0 : 1;
        this.initRoundRecord();
    }
    initRoundRecord() {
        for (let i = 1; i < 11; i++) {
            this.roundRecord.push({ type: "upcoming", wasAttack: this.isAttacking, round: i });
        }
    }
    receiveTeamSpecificData(data) {
        switch (data.type) {
            case eventData_1.DataTypes.ROSTER:
                this.processRosterData(data.data);
                break;
            case eventData_1.DataTypes.SCOREBOARD:
                this.processScoreboardData(data.data);
                break;
            case eventData_1.DataTypes.KILLFEED:
                this.processKillfeedData(data.data);
                break;
            case eventData_1.DataTypes.AUX_SCOREBOARD:
                this.processAuxScoreboardData(data.data);
                break;
            case eventData_1.DataTypes.AUX_ABILITIES:
                this.processAuxAbilityData(data);
                break;
            case eventData_1.DataTypes.AUX_HEALTH:
                this.processAuxHealthData(data);
                break;
            case eventData_1.DataTypes.AUX_ASTRA_TARGETING:
                this.processAuxAstraTargeting(data);
                break;
            default:
                break;
        }
    }
    resetRoundSpecificValues(isSideSwitch) {
        for (const player of this.players) {
            player.resetRoundSpecificValues(isSideSwitch);
        }
    }
    getSpentThisRound() {
        let total = 0;
        for (const player of this.players) {
            total += player.getMoneySpent();
        }
        return total;
    }
    hasTeamMemberByName(playerName) {
        return this.players.some((player) => player.getName() === playerName);
    }
    hasTeamMemberBySearchName(playerSearchName) {
        return this.players.some((player) => player.getSearchName() === playerSearchName);
    }
    hasTeamMemberById(playerId) {
        return this.players.some((player) => player.getPlayerId() === playerId);
    }
    getPlayerCount() {
        return this.playerCount;
    }
    findDuplicateAgents() {
        const seen = [];
        for (const player of this.players) {
            if (seen.includes(player.getAgentInternal())) {
                this.hasDuplicateAgents = true;
                break;
            }
            seen.push(player.getAgentInternal());
        }
    }
    switchSides() {
        this.isAttacking = !this.isAttacking;
    }
    setObservedPlayer(observedName) {
        for (const player of this.players) {
            player.processObservedEvent(observedName);
        }
    }
    processRosterData(data) {
        if (data.playerId == "" || data.name == "" || data.tagline == "")
            return;
        const correctPlayer = this.players.find((player) => player.getPlayerId() === data.playerId);
        if (correctPlayer) {
            correctPlayer.onRosterUpdate(data);
            return;
        }
        else if (this.playerCount < 5) {
            this.players.push(new Player_1.Player(data));
            this.isAttacking = data.startTeam == 0 ? true : false;
            this.playerCount++;
        }
        else {
            Log.error(`Received roster data for ${data.name} but team ${this.teamName} is full!`);
        }
    }
    processScoreboardData(data) {
        const player = this.players.find((player) => player.getPlayerId() === data.playerId);
        if (!player)
            return;
        player.updateFromScoreboard(data);
        this.spentThisRound = this.getSpentThisRound();
    }
    processKillfeedData(data) {
        const attacker = this.players.find((player) => player.getName() === data.attacker);
        if (attacker) {
            attacker.extractKillfeedInfo(data);
            attacker.fallbackKillfeedExtraction(data);
            if (!this.hasDuplicateAgents) {
                for (const assistData of data.assists) {
                    const assister = this.players.find((player) => player.getAgentInternal() === ValorantInternalTranslator_1.Agents[assistData]);
                    if (!assister)
                        continue;
                    assister.fallbackAssistIncrement();
                }
            }
        }
        const victim = this.players.find((player) => player.getName() === data.victim);
        if (!victim)
            return;
        victim.fallbackKillfeedExtraction(data, true);
    }
    processAuxScoreboardData(data) {
        const player = this.players.find((player) => player.getPlayerId() === data.playerId);
        if (!player)
            return;
        player.updateFromAuxiliaryScoreboard(data);
    }
    processAuxAbilityData(data) {
        const player = this.players.find((player) => player.getPlayerId() === data.playerId);
        if (!player)
            return;
        const incoming = data.data;
        player.updateAbilities({
            grenade: incoming.grenade,
            ability1: incoming.ability_1,
            ability2: incoming.ability_2,
        });
    }
    processAuxHealthData(data) {
        const player = this.players.find((player) => player.getPlayerId() === data.playerId);
        if (!player)
            return;
        if (typeof data.data != "number")
            return;
        player.setHeatlh(data.data);
    }
    processAuxAstraTargeting(data) {
        const player = this.players.find((player) => player.getPlayerId() === data.playerId);
        if (!player)
            return;
        if (typeof data.data != "boolean")
            return;
        player.setAstraTargeting(data.data);
    }
    teamKills() {
        let count = 0;
        for (const player of this.players) {
            count += player.getKillsThisRound();
        }
        return count;
    }
    resetTeamKills() {
        for (const player of this.players) {
            player.resetKillsThisRound();
        }
    }
    alivePlayers() {
        if (this.playerCount == 0)
            return 1;
        let count = 0;
        for (const player of this.players) {
            if (player.checkIsAlive()) {
                count++;
            }
        }
        return count;
    }
    addRoundReason(reason, roundNumber) {
        const arrayPos = roundNumber - 1;
        this.roundRecord[arrayPos] = {
            type: reason,
            wasAttack: this.isAttacking,
            round: roundNumber,
        };
        this.roundRecord[arrayPos + 1] = {
            type: "upcoming",
            wasAttack: this.isAttacking,
            round: roundNumber + 1,
        };
    }
    setAuxDisconnected(playerId) {
        const player = this.players.find((player) => player.getPlayerId() === playerId);
        if (player) {
            player.setAuxDisconnected();
        }
    }
}
exports.Team = Team;
