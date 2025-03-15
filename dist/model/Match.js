"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Match = void 0;
const Team_1 = require("./Team");
const eventData_1 = require("./eventData");
const Logging_1 = __importDefault(require("../util/Logging"));
const ReplayLogging_1 = require("../util/ReplayLogging");
const ValorantInternalTranslator_1 = require("../util/ValorantInternalTranslator");
const MatchController_1 = require("../controller/MatchController");
const databaseConnector_1 = require("../connector/databaseConnector");
const ToolsData_1 = require("./ToolsData");
const Log = (0, Logging_1.default)("Match");
class Match {
    matchId = "";
    matchType = "bomb";
    switchRound = 13;
    firstOtRound = 25;
    groupCode;
    isRunning = false;
    roundNumber = 0;
    roundPhase = "LOBBY";
    roundTimeoutTime = undefined;
    wasTimeout = false;
    spikeDetonationTime = undefined;
    teams = [];
    map = "Loading";
    spikeState = { planted: false, detonated: false, defused: false };
    attackersWon = false;
    timeoutState = {
        techPause: false,
        leftTeam: false,
        rightTeam: false,
        timeRemaining: 0,
    };
    timeoutEndTimeout = undefined;
    timeoutRemainingLoop = undefined;
    tools;
    replayLog;
    eventNumber = 1;
    organizationId = "";
    isRegistered = false;
    constructor(data) {
        this.groupCode = data.groupCode;
        this.replayLog = new ReplayLogging_1.ReplayLogging(data);
        const firstTeam = new Team_1.Team(data.leftTeam);
        const secondTeam = new Team_1.Team(data.rightTeam);
        this.teams.push(firstTeam);
        this.teams.push(secondTeam);
        this.tools = new ToolsData_1.ToolsData(data.toolsData);
        if (process.env.USE_BACKEND === "true") {
            this.organizationId = data.organizationId || "";
        }
    }
    async receiveMatchSpecificData(data) {
        this.replayLog.write(data);
        let correctTeam = null;
        switch (data.type) {
            case eventData_1.DataTypes.SCOREBOARD:
            case eventData_1.DataTypes.ROSTER:
                correctTeam = this.teams.find((team) => team.ingameTeamId == data.data.startTeam);
                if (correctTeam == null) {
                    Log.error(`Received match data with invalid team for group code "${data.groupCode}"`);
                    Log.debug(`Data: ${JSON.stringify(data)}`);
                    return;
                }
                correctTeam.receiveTeamSpecificData(data);
                break;
            case eventData_1.DataTypes.KILLFEED:
                this.teams.forEach((team) => team.receiveTeamSpecificData(data));
                break;
            case eventData_1.DataTypes.OBSERVING:
                for (const team of this.teams) {
                    team.setObservedPlayer(data.data);
                }
                break;
            case eventData_1.DataTypes.AUX_SCOREBOARD:
                this.teams.forEach((team) => team.receiveTeamSpecificData(data));
                break;
            case eventData_1.DataTypes.AUX_ABILITIES:
                this.teams.forEach((team) => team.receiveTeamSpecificData(data));
                break;
            case eventData_1.DataTypes.AUX_HEALTH:
                this.teams.forEach((team) => team.receiveTeamSpecificData(data));
                break;
            case eventData_1.DataTypes.AUX_ASTRA_TARGETING:
                this.teams.forEach((team) => team.receiveTeamSpecificData(data));
                break;
            case eventData_1.DataTypes.SPIKE_PLANTED:
                if (this.roundPhase !== "combat")
                    break;
                this.spikeState.planted = true;
                this.roundTimeoutTime = undefined;
                this.spikeDetonationTime = data.timestamp + 45 * 1000;
                break;
            case eventData_1.DataTypes.SPIKE_DETONATED:
                this.spikeState.detonated = true;
                this.spikeDetonationTime = undefined;
                break;
            case eventData_1.DataTypes.SPIKE_DEFUSED:
                this.spikeState.defused = true;
                break;
            case eventData_1.DataTypes.SCORE:
                this.processScoreCalculation(data.data, data.timestamp);
                this.spikeState.planted = false;
                break;
            case eventData_1.DataTypes.ROUND_INFO:
                this.roundNumber = data.data.roundNumber;
                this.roundPhase = data.data.roundPhase;
                switch (this.roundPhase) {
                    case "shopping":
                        if (this.roundNumber !== 1) {
                            this.processRoundReasons();
                        }
                        this.spikeState.planted = false;
                        this.spikeState.detonated = false;
                        this.spikeState.defused = false;
                        let isSwitchRound = false;
                        if (this.roundNumber == this.switchRound || this.roundNumber >= this.firstOtRound) {
                            for (const team of this.teams) {
                                team.switchSides();
                            }
                            isSwitchRound = true;
                        }
                        this.teams.forEach((team) => team.resetRoundSpecificValues(isSwitchRound));
                        if (this.isRegistered && this.roundNumber !== 1) {
                            databaseConnector_1.DatabaseConnector.updateMatch(this);
                        }
                        break;
                    case "combat":
                        this.teams.forEach((team) => team.findDuplicateAgents());
                        this.roundTimeoutTime = data.timestamp + 99 * 1000;
                        break;
                    case "end":
                        this.roundTimeoutTime = undefined;
                        this.spikeDetonationTime = undefined;
                        break;
                    case "game_end":
                        this.isRunning = false;
                        this.eventNumber++;
                        MatchController_1.MatchController.getInstance().removeMatch(this.groupCode);
                        if (this.isRegistered) {
                            databaseConnector_1.DatabaseConnector.completeMatch(this);
                        }
                        return;
                }
                break;
            case eventData_1.DataTypes.MATCH_START:
                this.matchId = data.data;
                this.isRunning = true;
                if (process.env.USE_BACKEND === "true") {
                    await databaseConnector_1.DatabaseConnector.registerMatch(this);
                    this.isRegistered = true;
                }
                break;
            case eventData_1.DataTypes.MAP:
                this.map = ValorantInternalTranslator_1.Maps[data.data];
                break;
            case eventData_1.DataTypes.GAME_MODE:
                this.matchType = data.data;
                switch (this.matchType) {
                    case "swift":
                        this.switchRound = 5;
                        this.firstOtRound = 99;
                        break;
                    case "bomb":
                    default:
                        this.switchRound = 13;
                        this.firstOtRound = 25;
                        break;
                }
                break;
            case eventData_1.DataTypes.TECH_PAUSE:
                this.timeoutState.techPause = !this.timeoutState.techPause;
                if (this.timeoutState.techPause) {
                    this.timeoutState.leftTeam = false;
                    this.timeoutState.rightTeam = false;
                    clearTimeout(this.timeoutEndTimeout);
                    clearInterval(this.timeoutRemainingLoop);
                    this.timeoutEndTimeout = null;
                }
                break;
            case eventData_1.DataTypes.LEFT_TIMEOUT:
                this.timeoutState.leftTeam = !this.timeoutState.leftTeam;
                if (this.timeoutState.leftTeam) {
                    this.timeoutState.rightTeam = false;
                    this.timeoutState.techPause = false;
                    this.timeoutState.timeRemaining = this.tools.timeoutDuration;
                    this.startTimeoutEndTimeout();
                }
                else {
                    clearTimeout(this.timeoutEndTimeout);
                }
                break;
            case eventData_1.DataTypes.RIGHT_TIMEOUT:
                this.timeoutState.rightTeam = !this.timeoutState.rightTeam;
                if (this.timeoutState.rightTeam) {
                    this.timeoutState.leftTeam = false;
                    this.timeoutState.techPause = false;
                    this.timeoutState.timeRemaining = this.tools.timeoutDuration;
                    this.startTimeoutEndTimeout();
                }
                else {
                    clearTimeout(this.timeoutEndTimeout);
                }
                break;
        }
        this.eventNumber++;
    }
    startTimeoutEndTimeout() {
        clearTimeout(this.timeoutEndTimeout);
        this.timeoutEndTimeout = null;
        clearInterval(this.timeoutRemainingLoop);
        this.timeoutRemainingLoop = null;
        this.timeoutEndTimeout = setTimeout(() => {
            this.timeoutState.leftTeam = false;
            this.timeoutState.rightTeam = false;
            clearInterval(this.timeoutRemainingLoop);
            this.eventNumber++;
        }, this.tools.timeoutDuration * 1000);
        this.timeoutRemainingLoop = setInterval(() => {
            if (this.timeoutState.timeRemaining > 0) {
                this.timeoutState.timeRemaining--;
                this.eventNumber++;
            }
            else {
                clearInterval(this.timeoutRemainingLoop);
            }
        }, 1000);
    }
    processScoreCalculation(data, eventTimestamp) {
        const team0NewScore = data.team_0;
        const team1NewScore = data.team_1;
        const team0 = this.teams.find((team) => team.ingameTeamId == 0);
        const team1 = this.teams.find((team) => team.ingameTeamId == 1);
        if (team0NewScore > team0.roundsWon) {
            this.attackersWon = team0.isAttacking;
        }
        else if (team1NewScore > team1.roundsWon) {
            this.attackersWon = team1.isAttacking;
        }
        if (this.roundTimeoutTime && eventTimestamp >= this.roundTimeoutTime) {
            this.wasTimeout = true;
        }
        else {
            this.wasTimeout = false;
        }
        team0.roundsWon = team0NewScore;
        team1.roundsWon = team1NewScore;
    }
    processRoundReasons() {
        const attackingTeam = this.teams.find((team) => team.isAttacking == true);
        const defendingTeam = this.teams.find((team) => team.isAttacking == false);
        if (this.attackersWon) {
            if (this.spikeState.detonated) {
                attackingTeam.addRoundReason("detonated", this.roundNumber - 1);
            }
            else {
                attackingTeam.addRoundReason("kills", this.roundNumber - 1);
            }
            defendingTeam.addRoundReason("lost", this.roundNumber - 1);
        }
        else {
            if (this.spikeState.defused) {
                defendingTeam.addRoundReason("defused", this.roundNumber - 1);
            }
            else if (this.wasTimeout) {
                defendingTeam.addRoundReason("timeout", this.roundNumber - 1);
            }
            else {
                defendingTeam.addRoundReason("kills", this.roundNumber - 1);
            }
            attackingTeam.addRoundReason("lost", this.roundNumber - 1);
        }
    }
    setAuxDisconnected(playerId) {
        this.teams.forEach((team) => team.setAuxDisconnected(playerId));
    }
    debugLogRoundInfo() {
        Log.debug(`Round ${this.roundNumber} - ${this.roundPhase}`);
        Log.debug(`Round Timeout: ${this.roundTimeoutTime}`);
        Log.debug(`Spike State: ${JSON.stringify(this.spikeState)}`);
        const attackingTeam = this.teams.find((team) => team.isAttacking);
        const defendingTeam = this.teams.find((team) => !team.isAttacking);
        Log.debug(`Attacking Team: ${attackingTeam?.alivePlayers()} - Defending Team: ${defendingTeam?.alivePlayers()}`);
    }
}
exports.Match = Match;
