"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReplayConnectorService = void 0;
const eventData_1 = require("../model/eventData");
const Logging_1 = __importDefault(require("../util/Logging"));
const io = __importStar(require("socket.io-client"));
const Log = (0, Logging_1.default)("ReplayConnectorService");
class ReplayConnectorService {
    obsName = "Replayuser#test";
    key = "DEBUG_REMOVE_ME";
    groupCode = "A";
    leftTeam = {
        name: "Left Team",
        tricode: "LEFT",
        url: "https://dnkl.gg/PHtt7",
        attackStart: true,
    };
    rightTeam = {
        name: "Right Team",
        tricode: "RIGHT",
        url: "https://dnkl.gg/8GKvE",
        attackStart: false,
    };
    clientVersion = "";
    ingestServerUrl;
    enabled = false;
    unreachable = false;
    ws;
    constructor(ingestServerUrl) {
        this.ingestServerUrl = ingestServerUrl;
    }
    setAuthValues(obsName, groupCode, accessKey, leftTeam, rightTeam, clientVersion) {
        this.obsName = obsName;
        this.groupCode = groupCode;
        this.key = accessKey;
        this.leftTeam = leftTeam;
        this.rightTeam = rightTeam;
        this.clientVersion = clientVersion;
    }
    open() {
        return new Promise((resolve) => {
            this.handleAuthProcess().then(() => {
                resolve();
            });
        });
    }
    close() {
        if (this.enabled) {
            this.ws.close();
            this.enabled = false;
        }
    }
    handleAuthProcess() {
        return new Promise((resolve, reject) => {
            this.ws = io.connect(this.ingestServerUrl);
            const authData = {
                type: eventData_1.DataTypes.AUTH,
                clientVersion: this.clientVersion,
                obsName: this.obsName,
                groupCode: this.groupCode,
                key: this.key,
                leftTeam: this.leftTeam,
                rightTeam: this.rightTeam,
                toolsData: {
                    seriesInfo: {
                        needed: 3,
                        wonLeft: 1,
                        wonRight: 2,
                        mapInfo: [
                            {
                                type: "past",
                                map: "Ascent",
                                left: {
                                    logo: "https://dnkl.gg/PHtt7",
                                    score: 13,
                                },
                                right: {
                                    logo: "https://dnkl.gg/8GKvE",
                                    score: 6,
                                },
                            },
                            {
                                type: "present",
                                logo: "https://dnkl.gg/8GKvE",
                            },
                            {
                                type: "future",
                                map: "Bind",
                                logo: "https://dnkl.gg/PHtt7",
                            },
                        ],
                    },
                    seedingInfo: {
                        left: "Group 1",
                        right: "Group 2",
                    },
                    tournamentInfo: {
                        name: "Tournament Name",
                        logoUrl: "",
                        backdropUrl: "",
                        enabled: true,
                    },
                    timeoutDuration: 60,
                },
            };
            this.ws.emit("obs_logon", JSON.stringify(authData));
            this.ws.once("obs_logon_ack", (msg) => {
                const json = JSON.parse(msg.toString());
                if (json.type === eventData_1.DataTypes.AUTH) {
                    if (json.value === true) {
                        Log.info("Authentication successful!");
                        this.enabled = true;
                        this.websocketSetup();
                        resolve();
                    }
                    else {
                        Log.error("Authentication failed!");
                        this.enabled = false;
                        this.ws?.disconnect();
                        reject();
                    }
                }
            });
            this.ws.io.on("close", () => {
                this.onSocketClose();
                reject();
            });
            this.ws.on("error", (e) => {
                this.onSocketError(e);
                reject();
            });
            this.ws.on("connect_error", (e) => {
                this.onSocketError(e);
                reject();
            });
        });
    }
    onSocketClose() {
        Log.info("Connection to ingest server closed");
        if (this.unreachable === true) {
            Log.error(`Inhouse Tracker | Connection failed, server not reachable`);
        }
        else {
            Log.info(`Inhouse Tracker | Connection closed`);
        }
        this.enabled = false;
    }
    onSocketError(e) {
        Log.error("Failed connection to ingest server - is it up?");
        if (e.code === "ECONNREFUSED") {
            Log.error(`Inhouse Tracker | Connection failed, server not reachable`);
            this.unreachable = true;
        }
        else {
            Log.error(`Inhouse Tracker | Connection failed`);
        }
        Log.info(e);
    }
    websocketSetup() {
        this.ws.on("message", (msg) => {
            const json = JSON.parse(msg.toString());
            Log.info(json);
        });
    }
    sendReplayData(data) {
        if (this.enabled) {
            Log.info(`Sending ${data.type} event`);
            this.ws.emit("obs_data", JSON.stringify(data));
        }
        else {
            Log.error("Tried to send event anthough webservice is not enabled. Too early?");
        }
    }
}
exports.ReplayConnectorService = ReplayConnectorService;
