"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebsocketOutgoing = void 0;
require("dotenv").config();
const socket_io_1 = require("socket.io");
const Logging_1 = __importDefault(require("../util/Logging"));
const fs_1 = require("fs");
const https_1 = require("https");
const http_1 = require("http");
const MatchController_1 = require("../controller/MatchController");
const Log = (0, Logging_1.default)("WebsocketOutgoing");
class WebsocketOutgoing {
    static instance;
    wss;
    static getInstance() {
        if (WebsocketOutgoing.instance == null)
            WebsocketOutgoing.instance = new WebsocketOutgoing();
        return WebsocketOutgoing.instance;
    }
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
            ws.on("error", (e) => {
                Log.error(`Someone in ${ws.rooms} encountered a Websocket error: ${e}`);
            });
            ws.once("logon", (msg) => {
                try {
                    const json = JSON.parse(msg);
                    ws.join(json.groupCode);
                    ws.emit("logon_success", JSON.stringify({
                        groupCode: json.groupCode,
                        msg: `Logon succeeded for group code ${json.groupCode}`,
                    }));
                    Log.info(`Received output logon using Group Code ${json.groupCode}`);
                    MatchController_1.MatchController.getInstance().sendMatchDataForLogon(json.groupCode);
                }
                catch (e) {
                    Log.error(`Error parsing outgoing logon request: ${e}`);
                }
            });
        });
        this.wss.engine.on("connection_error", (err) => {
            Log.error("Socket.IO error: " + err);
        });
        serverInstance.listen(5200);
        Log.info(`InhouseTracker Server outputting on port 5200!`);
    }
    sendMatchData(groupCode, data) {
        const { replayLog, eventNumber, timeoutEndTimeout, timeoutRemainingLoop, ...formattedData } = data;
        this.wss.to(groupCode).emit("match_data", JSON.stringify(formattedData));
    }
}
exports.WebsocketOutgoing = WebsocketOutgoing;
