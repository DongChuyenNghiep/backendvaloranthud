"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchController = void 0;
const databaseConnector_1 = require("../connector/databaseConnector");
const websocketIncoming_1 = require("../connector/websocketIncoming");
const websocketOutgoing_1 = require("../connector/websocketOutgoing");
const Match_1 = require("../model/Match");
const Logging_1 = __importDefault(require("../util/Logging"));
const Log = (0, Logging_1.default)("MatchController");
class MatchController {
    static instance;
    outgoingWebsocketServer = websocketOutgoing_1.WebsocketOutgoing.getInstance();
    sendInterval = null;
    matches = {};
    eventNumbers = {};
    eventTimes = {};
    constructor() { }
    static getInstance() {
        if (MatchController.instance == null)
            MatchController.instance = new MatchController();
        return MatchController.instance;
    }
    async createMatch(data) {
        try {
            if (this.matches[data.groupCode] != null) {
                return false;
            }
            const newMatch = new Match_1.Match(data);
            this.matches[data.groupCode] = newMatch;
            this.eventNumbers[data.groupCode] = 0;
            Log.info(`New match "${newMatch.groupCode}" registered!`);
            this.startOutgoingSendLoop();
            return true;
        }
        catch (e) {
            Log.info(`Failed to create match with group code ${data.groupCode}, ${e}`);
            return false;
        }
    }
    findMatch(matchId) {
        return Object.values(this.matches).find((match) => match.matchId == matchId)?.groupCode ?? null;
    }
    removeMatch(groupCode) {
        if (this.matches[groupCode] != null) {
            delete this.matches[groupCode];
            delete this.eventNumbers[groupCode];
            websocketIncoming_1.WebsocketIncoming.disconnectGroupCode(groupCode);
            Log.info(`Deleted match with group code ${groupCode}`);
            if (Object.keys(this.matches).length == 0 && this.sendInterval != null) {
                clearInterval(this.sendInterval);
                this.sendInterval = null;
                Log.info(`Last match concluded, send loop stopped`);
            }
        }
    }
    getMatchCount() {
        return Object.keys(this.matches).length;
    }
    async receiveMatchData(data) {
        data.timestamp = Date.now();
        if ("groupCode" in data) {
            const trackedMatch = this.matches[data.groupCode];
            if (trackedMatch == null) {
                Log.info(`Received match data with invalid game "${data.groupCode}"`);
                return;
            }
            await trackedMatch.receiveMatchSpecificData(data);
        }
        else if ("matchId" in data) {
            for (const match of Object.values(this.matches)) {
                if (match.matchId == data.matchId) {
                    await match.receiveMatchSpecificData(data);
                }
            }
        }
    }
    async receiveAuxMatchData(data) {
        data.timestamp = Date.now();
        for (const match of Object.values(this.matches)) {
            if (match.matchId == data.matchId) {
                await match.receiveMatchSpecificData(data);
            }
        }
    }
    setAuxDisconnected(groupCode, playerId) {
        if (this.matches[groupCode] != null) {
            this.matches[groupCode].setAuxDisconnected(playerId);
        }
    }
    sendMatchDataForLogon(groupCode) {
        if (this.matches[groupCode] != null) {
            const { replayLog, eventNumber, timeoutEndTimeout, timeoutRemainingLoop, ...formattedData } = this.matches[groupCode];
            this.outgoingWebsocketServer.sendMatchData(groupCode, formattedData);
        }
    }
    startOutgoingSendLoop() {
        if (this.sendInterval != null) {
            Log.info(`Match registered with active send loop, skipping start`);
            return;
        }
        Log.info(`Match registered without active send loop, send loop started`);
        this.sendInterval = setInterval(async () => {
            for (const groupCode in this.matches) {
                if (this.matches[groupCode].eventNumber > this.eventNumbers[groupCode]) {
                    this.outgoingWebsocketServer.sendMatchData(groupCode, this.matches[groupCode]);
                    this.eventNumbers[groupCode] = this.matches[groupCode].eventNumber;
                    this.eventTimes[groupCode] = Date.now();
                }
                else {
                    if (Date.now() - this.eventTimes[groupCode] > 1000 * 60 * 30) {
                        Log.info(`Match with group code ${groupCode} has been inactive for more than 30 minutes, removing.`);
                        try {
                            if (this.matches[groupCode].isRegistered) {
                                await databaseConnector_1.DatabaseConnector.completeMatch(this.matches[groupCode]);
                            }
                        }
                        catch (e) {
                            Log.error(`Failed to complete match in backend with group code ${groupCode}, ${e}`);
                        }
                        this.removeMatch(groupCode);
                    }
                }
            }
        }, 100);
    }
}
exports.MatchController = MatchController;
