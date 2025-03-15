"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReplayMode = exports.ReplayPlayer = void 0;
const fs_1 = require("fs");
const Logging_1 = __importDefault(require("../util/Logging"));
const Log = (0, Logging_1.default)("ReplayPlayer");
class ReplayPlayer {
    connector;
    mode;
    delay = 500;
    replayHeaderData;
    replayData = [];
    currentReplayIndex = 0;
    finishedCallback;
    constructor(replayConnectorService, replayMode, delay) {
        this.connector = replayConnectorService;
        this.mode = replayMode;
        if (delay != null)
            this.delay = delay;
    }
    loadReplayFile(filePath) {
        const replayContent = (0, fs_1.readFileSync)(filePath).toString();
        const replayObj = JSON.parse(`[${replayContent}]`);
        this.replayHeaderData = replayObj.shift();
        this.replayData = replayObj;
        Log.info(`Loaded replay file ${filePath}`);
        Log.info("Header info is:");
        Log.info(this.replayHeaderData);
    }
    getReplayHeader() {
        return this.replayHeaderData;
    }
    play(callback) {
        this.finishedCallback = callback;
        Log.info(`Starting playback in ${this.mode} mode`);
        new Promise(() => {
            switch (this.mode) {
                case ReplayMode.INSTANT:
                    this.playInstant();
                    break;
                case ReplayMode.DELAY:
                    this.playDelay();
                    break;
                case ReplayMode.TIMESTAMPS:
                    this.playTimestamps();
                    break;
                case ReplayMode.MANUAL:
                    this.playManual();
                    break;
            }
        });
    }
    sendNextEvent() {
        if (this.currentReplayIndex % 50 === 0) {
            Log.info(`Current Event: ${this.currentReplayIndex}`);
        }
        this.connector.sendReplayData(this.replayData[this.currentReplayIndex]);
        if (this.replayData[this.currentReplayIndex].type == "round_info" &&
            this.replayData[this.currentReplayIndex].data.roundPhase ==
                "game_end") {
            return false;
        }
        this.currentReplayIndex++;
        return this.currentReplayIndex < this.replayData.length;
    }
    finished() {
        Log.info("Replay has finished");
        if (this.finishedCallback != null) {
            this.finishedCallback();
        }
    }
    playInstant() {
        while (this.sendNextEvent()) {
        }
        this.finished();
    }
    playDelay() {
        const intervalId = setInterval(() => {
            if (!this.sendNextEvent()) {
                clearInterval(intervalId);
                this.finished();
            }
            Log.info(`Waiting ${this.delay} ms`);
        }, this.delay);
    }
    playTimestamps() {
        if (this.sendNextEvent()) {
            const timestamp1 = this.replayData[this.currentReplayIndex - 1].timestamp;
            const timestamp2 = this.replayData[this.currentReplayIndex].timestamp;
            const nextDelay = timestamp2 - timestamp1;
            Log.info(`Waiting ${nextDelay} ms`);
            setTimeout(() => this.playTimestamps(), nextDelay);
        }
        else {
            this.finished();
        }
    }
    playManual() {
        const stream = process.stdin;
        stream.on("data", (data) => {
            const s = data.toString();
            const amount = Number.parseInt(s);
            let ready = true;
            if (s == "\n") {
                ready = this.sendNextEvent();
            }
            else if (s == "exit\n") {
                ready = false;
            }
            else if (s == "go\n") {
                const interval = setInterval(() => {
                    if (!this.sendNextEvent()) {
                        ready = false;
                        clearInterval(interval);
                    }
                }, 1);
            }
            else if (!Number.isNaN(amount)) {
                Log.info(`Sending the next ${amount} events`);
                let i = 0;
                const interval = setInterval(() => {
                    if (!(i < amount && (ready = this.sendNextEvent()))) {
                        clearInterval(interval);
                    }
                    i++;
                }, 1);
                Log.info(`Now on event ${this.currentReplayIndex}`);
            }
            if (!ready) {
                stream.removeAllListeners();
                this.finished();
            }
        });
        Log.info("Ready ['exit' to exit | 'go' to finish replay]");
    }
}
exports.ReplayPlayer = ReplayPlayer;
var ReplayMode;
(function (ReplayMode) {
    ReplayMode["DELAY"] = "delay";
    ReplayMode["INSTANT"] = "instant";
    ReplayMode["TIMESTAMPS"] = "timestamps";
    ReplayMode["MANUAL"] = "manual";
})(ReplayMode || (exports.ReplayMode = ReplayMode = {}));
