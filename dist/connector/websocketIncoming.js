"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebsocketIncoming = void 0;
require("dotenv").config();
const socket_io_1 = require("socket.io");
const eventData_1 = require("../model/eventData");
const MatchController_1 = require("../controller/MatchController");
const Logging_1 = __importDefault(require("../util/Logging"));
const fs_1 = require("fs");
const https_1 = require("https");
const http_1 = require("http");
const databaseConnector_1 = require("./databaseConnector");
const CompatibleClients_1 = require("../util/CompatibleClients");
const Log = (0, Logging_1.default)("WebsocketIncoming");
class WebsocketIncoming {
    wss;
    static authedClients = [];
    matchController = MatchController_1.MatchController.getInstance();
    constructor() {
        let serverInstance;
        if (process.env.INSECURE == "true") {
            serverInstance = (0, http_1.createServer)();
        }
        else {
            if (!process.env.SERVER_KEY || !process.env.SERVER_CERT) {
                Log.error(`Missing TLS key or certificate! Please provide the paths to the key and certificate in the .env file. (SERVER_KEY and SERVER_CERT)`);
            }
            const options = {
                key: (0, fs_1.readFileSync)(process.env.SERVER_KEY),
                cert: (0, fs_1.readFileSync)(process.env.SERVER_CERT),
            };
            serverInstance = (0, https_1.createServer)(options);
        }
        this.wss = new socket_io_1.Server(serverInstance, {
            perMessageDeflate: {
                zlibDeflateOptions: {
                    chunkSize: 1024,
                    memLevel: 7,
                    level: 3,
                },
                zlibInflateOptions: {
                    chunkSize: 10 * 1024,
                },
                threshold: 1024,
            },
            cors: { origin: "*" },
        });
        this.wss.on(`connection`, (ws) => {
            const user = new ClientUser("New User", "Unknown Team", ws);
            ws.on("error", () => {
                Log.error(`${user.name} encountered a Websocket error.`);
            });
            ws.once("obs_logon", async (msg) => {
                try {
                    const authenticationData = JSON.parse(msg.toString());
                    if (WebsocketIncoming.authedClients.find((client) => client.ws.id === ws.id) != undefined)
                        return;
                    if (authenticationData.type !== eventData_1.DataTypes.AUTH) {
                        ws.emit("obs_logon_ack", JSON.stringify({ type: eventData_1.DataTypes.AUTH, value: false, reason: `Invalid packet.` }));
                        ws.disconnect();
                        Log.info(`Received BAD auth request, invalid packet.`);
                        return;
                    }
                    if (!(0, CompatibleClients_1.isCompatibleVersion)(authenticationData.clientVersion)) {
                        ws.emit("obs_logon_ack", JSON.stringify({
                            type: eventData_1.DataTypes.AUTH,
                            value: false,
                            reason: `Client version ${authenticationData.clientVersion} is not compatible with server version ${module.exports.version}.`,
                        }));
                        ws.disconnect();
                        Log.info(`Received BAD auth request from ${authenticationData.obsName}, using Group Code ${authenticationData.groupCode} and key ${authenticationData.key}, incompatible client version ${authenticationData.clientVersion}.`);
                        return;
                    }
                    const validity = await this.isValidKey(authenticationData.key);
                    if (validity.valid === false) {
                        ws.emit("obs_logon_ack", JSON.stringify({ type: eventData_1.DataTypes.AUTH, value: false, reason: validity.reason }));
                        ws.disconnect();
                        Log.info(`Received BAD auth request from ${authenticationData.obsName}, using Group Code ${authenticationData.groupCode} and key ${authenticationData.key}`);
                        return;
                    }
                    else {
                        if (validity.organizationId) {
                            authenticationData.organizationId = validity.organizationId;
                        }
                    }
                    if (!(await this.matchController.createMatch(authenticationData))) {
                        ws.emit("obs_logon_ack", JSON.stringify({
                            type: eventData_1.DataTypes.AUTH,
                            value: false,
                            reason: `Game with Group Code ${authenticationData.groupCode} exists and is still live.`,
                        }));
                        ws.disconnect();
                        Log.info(`Received BAD auth request from ${authenticationData.obsName}, using Group Code ${authenticationData.groupCode} and key ${authenticationData.key}`);
                        return;
                    }
                    ws.emit("obs_logon_ack", JSON.stringify({ type: eventData_1.DataTypes.AUTH, value: true }));
                    user.name = authenticationData.obsName;
                    user.groupCode = authenticationData.groupCode;
                    WebsocketIncoming.authedClients.push(user);
                    Log.info(`Received VALID auth request from ${authenticationData.obsName}, using Group Code ${authenticationData.groupCode} and with teams ${authenticationData.leftTeam.name} and ${authenticationData.rightTeam.name}`);
                    this.onAuthSuccess(user);
                }
                catch (e) {
                    Log.error(`Error parsing incoming auth request: ${e}`);
                    Log.error(e);
                }
            });
            ws.once("aux_logon", async (msg) => {
                try {
                    const authenticationData = JSON.parse(msg.toString());
                    if (WebsocketIncoming.authedClients.find((client) => client.ws.id === ws.id) != undefined)
                        return;
                    if (authenticationData.type !== eventData_1.DataTypes.AUX_AUTH) {
                        ws.emit("aux_logon_ack", JSON.stringify({ type: eventData_1.DataTypes.AUTH, value: false, reason: `Invalid packet.` }));
                        ws.disconnect();
                        Log.info(`Received BAD aux auth request, invalid packet.`);
                        return;
                    }
                    if (!(0, CompatibleClients_1.isCompatibleVersion)(authenticationData.clientVersion)) {
                        ws.emit("aux_logon_ack", JSON.stringify({
                            type: eventData_1.DataTypes.AUTH,
                            value: false,
                            reason: `Client version ${authenticationData.clientVersion} is not compatible with server version ${module.exports.version}.`,
                        }));
                        ws.disconnect();
                        Log.info(`Received BAD aux auth request from ${authenticationData.playerId} for match ${authenticationData.matchId}, incompatible client version ${authenticationData.clientVersion}.`);
                        return;
                    }
                    const groupCode = this.matchController.findMatch(authenticationData.matchId);
                    if (groupCode == null) {
                        ws.emit("aux_logon_ack", JSON.stringify({
                            type: eventData_1.DataTypes.AUTH,
                            value: false,
                            reason: `Game with Match ID ${authenticationData.matchId} not found.`,
                        }));
                        ws.disconnect();
                        Log.info(`Received BAD aux auth request from ${authenticationData.playerId} for match ${authenticationData.matchId}, match not found.`);
                        return;
                    }
                    ws.emit("aux_logon_ack", JSON.stringify({ type: eventData_1.DataTypes.AUX_AUTH, value: true }));
                    user.name = authenticationData.name;
                    user.groupCode = groupCode;
                    user.isAuxiliary = true;
                    user.playerId = authenticationData.playerId;
                    WebsocketIncoming.authedClients.push(user);
                    Log.info(`Received VALID aux auth request from ${authenticationData.playerId} for Group Code ${groupCode}`);
                    this.onAuthSuccess(user);
                }
                catch (e) {
                    Log.error(`Error parsing incoming auth request: ${e}`);
                    Log.error(e);
                }
            });
            ws.on("disconnect", () => {
                const index = WebsocketIncoming.authedClients.findIndex((client) => client.ws.id === ws.id);
                if (index != -1) {
                    const client = WebsocketIncoming.authedClients[index];
                    if (client.playerId !== "") {
                        Log.info(`Auxiliary player ${client.playerId} disconnected.`);
                        this.matchController.setAuxDisconnected(client.groupCode, client.playerId);
                    }
                    if (client.isAuxiliary) {
                        WebsocketIncoming.authedClients.splice(index, 1);
                    }
                }
            });
        });
        serverInstance.listen(5100);
        Log.info(`InhouseTracker Server ingesting on port 5100!`);
    }
    onAuthSuccess(user) {
        user.ws.on("obs_data", async (msg) => {
            try {
                const data = JSON.parse(msg.toString());
                if ((0, eventData_1.isAuthedData)(data)) {
                    await this.matchController.receiveMatchData(data);
                }
            }
            catch (e) {
                Log.error(`Error parsing obs_data: ${e}`);
            }
        });
        user.ws.on("aux_data", async (msg) => {
            try {
                const data = JSON.parse(msg.toString());
                if ((0, eventData_1.isAuthedData)(data)) {
                    await this.matchController.receiveMatchData(data);
                    if (data.type === eventData_1.DataTypes.AUX_SCOREBOARD && user.playerId === "") {
                        user.playerId = data.playerId;
                    }
                }
            }
            catch (e) {
                Log.error(`Error parsing aux_data: ${e}`);
            }
        });
    }
    async isValidKey(key) {
        if (process.env.REQUIRE_AUTH_KEY === "false")
            return { valid: true, reason: databaseConnector_1.ValidityReasons.VALID };
        if (process.env.AUTH_KEY === key)
            return { valid: true, reason: databaseConnector_1.ValidityReasons.VALID };
        let validity = { valid: false, reason: databaseConnector_1.ValidityReasons.INVALID };
        if (process.env.USE_BACKEND === "true") {
            validity = await databaseConnector_1.DatabaseConnector.verifyAccessKey(key);
        }
        return validity;
    }
    static disconnectGroupCode(groupCode) {
        for (const client of WebsocketIncoming.authedClients) {
            if (client.groupCode === groupCode) {
                client.ws.disconnect();
            }
        }
    }
}
exports.WebsocketIncoming = WebsocketIncoming;
class ClientUser {
    name;
    groupCode;
    isAuxiliary = false;
    playerId = "";
    ws;
    constructor(name, groupCode, ws) {
        this.name = name;
        this.groupCode = groupCode;
        this.ws = ws;
    }
}
