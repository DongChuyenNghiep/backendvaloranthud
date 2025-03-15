"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
const ReplayPlayer_1 = require("./ReplayPlayer");
const ReplayConnectorService_1 = require("./ReplayConnectorService");
const Logging_1 = __importDefault(require("../util/Logging"));
const Log = (0, Logging_1.default)("Replay").level(1);
let INGEST_SERVER_URL = "http://localhost:5100/";
let REPLAY_FILE = "customGameTest.replay";
let REPLAY_MODE = ReplayPlayer_1.ReplayMode.INSTANT;
let DELAY_MS = 500;
const args = process.argv;
for (let i = 2; i < args.length; i++) {
    const arg = args[i];
    let logString = `Parameter ${arg}`;
    switch (arg) {
        case "-instant":
            REPLAY_MODE = ReplayPlayer_1.ReplayMode.INSTANT;
            break;
        case "-delay":
            const delay = parseInt(args[i + 1]);
            REPLAY_MODE = ReplayPlayer_1.ReplayMode.DELAY;
            if (!Number.isNaN(delay)) {
                i++;
                DELAY_MS = delay;
                logString += ` = ${DELAY_MS}`;
            }
            break;
        case "-game":
            REPLAY_FILE = args[++i];
            logString += ` = ${REPLAY_FILE}`;
            break;
        case "-timestamps":
            REPLAY_MODE = ReplayPlayer_1.ReplayMode.TIMESTAMPS;
            Log.info("Using timestamps mode");
            break;
        case "-manual":
            REPLAY_MODE = ReplayPlayer_1.ReplayMode.MANUAL;
            Log.info("Using manual mode");
            break;
        case "-server":
            INGEST_SERVER_URL = args[++i];
            Log.info(`Overriding ingest server url with ${INGEST_SERVER_URL}`);
            break;
        default:
            Log.error(`Unknown parameter ${arg}`);
    }
    Log.debug(logString);
}
const connector = new ReplayConnectorService_1.ReplayConnectorService(INGEST_SERVER_URL);
const player = new ReplayPlayer_1.ReplayPlayer(connector, REPLAY_MODE, DELAY_MS);
player.loadReplayFile(REPLAY_FILE);
const { obsName, groupCode, leftTeam, rightTeam, clientVersion } = player.getReplayHeader();
connector.setAuthValues(obsName, groupCode, "DEBUG_REMOVE_ME", leftTeam, rightTeam, clientVersion);
connector.open().then(() => {
    player.play(() => {
        connector.close();
    });
});
