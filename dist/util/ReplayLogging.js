"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReplayLogging = void 0;
const fs_1 = __importDefault(require("fs"));
const Logging_1 = __importDefault(require("./Logging"));
const Log = (0, Logging_1.default)("ReplayLogging").level(1);
class ReplayLogging {
    static writeLog = true;
    matchData;
    logStartTime;
    fileName;
    fileWriteStream;
    fileStartOffset = 0;
    writeReady = false;
    isOpening = false;
    isWriting = false;
    writeBuffer = [];
    constructor(data) {
        this.matchData = data;
        delete this.matchData.key;
        delete this.matchData.type;
        this.logStartTime = Date.now();
        this.fileName = `Match_${this.matchData.groupCode}_${this.logStartTime}.replay`;
        if (ReplayLogging.writeLog) {
            this.openFileStream();
        }
    }
    writeData(data) {
        if (!ReplayLogging.writeLog)
            return;
        this.writeBuffer.push(JSON.stringify(data));
        this.writeBufferToFile();
    }
    write(data) {
        this.writeData(data);
    }
    log(data) {
        this.writeData(data);
    }
    closeFile() {
        if (!ReplayLogging.writeLog)
            return;
        this.fileWriteStream.close();
    }
    openFileStream() {
        if (!fs_1.default.existsSync("./replays/")) {
            fs_1.default.mkdirSync("./replays/");
        }
        Log.info("Opening replay file " + this.fileName);
        this.fileWriteStream = fs_1.default.createWriteStream(`./replays/${this.fileName}`);
        this.fileWriteStream.on("ready", () => {
            Log.debug("Replay file " + this.fileName + " is ready");
            Log.debug("Writing file header");
            this.writeFileStart();
            this.writeReady = true;
            this.isOpening = false;
            this.writeBufferToFile();
        });
        this.fileWriteStream.on("close", () => {
            Log.debug(`Replay file ${this.fileName} closed`);
            this.writeReady = false;
        });
    }
    writeFileStart() {
        const headerData = {
            serverVersion: module.exports.version,
            ...this.matchData,
            logStartTime: this.logStartTime,
        };
        const dataString = JSON.stringify(headerData);
        this.fileWriteStream.write(dataString);
        return dataString.length;
    }
    writeFileEnd() {
        return 0;
    }
    writeFileContentDelimiter() {
        this.fileWriteStream.write(",\n");
        return 2;
    }
    async writeBufferToFile() {
        if (this.isWriting || !this.writeReady)
            return;
        this.isWriting = true;
        let s;
        while ((s = this.writeBuffer.shift()) != null) {
            this.writeFileContentDelimiter();
            this.fileWriteStream.write(s.toString());
        }
        this.isWriting = false;
    }
}
exports.ReplayLogging = ReplayLogging;
