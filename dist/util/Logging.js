"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = create;
const fs_1 = __importDefault(require("fs"));
class Logging {
    static globalLogLevel = 2;
    static forceGlobalLogLevel = false;
    static writeFile = false;
    static writeStream;
    static writeReady = false;
    static isOpening = false;
    static isWriting = false;
    static writeBuffer = [];
    static colorInfo = "\x1b[33m";
    static colorDebug = "\x1b[36m";
    static colorError = "\x1b[31m";
    static colorReset = "\x1b[0m";
    static writeLogfile(name, data) {
        if (!this.writeFile)
            return;
        if (typeof data == "object") {
            this.writeBuffer.push(`[${name}] Object`);
            this.writeBuffer.push(JSON.stringify(data));
        }
        else {
            this.writeBuffer.push(`[${name}] ${data}`);
        }
        if (!this.writeReady && !this.isOpening) {
            this.isOpening = true;
            if (!fs_1.default.existsSync("./logs/")) {
                fs_1.default.mkdirSync("./logs/");
            }
            this.writeStream = fs_1.default.createWriteStream(`./logs/log_${Date.now()}.txt`);
            this.writeStream.on("ready", () => {
                this.writeReady = true;
                this.isOpening = false;
                this.writeBufferToFile();
            });
            this.writeStream.on("close", () => {
                this.writeReady = false;
            });
        }
        else {
            this.writeBufferToFile();
        }
    }
    static async writeBufferToFile() {
        if (this.isWriting)
            return;
        this.isWriting = true;
        let s;
        while ((s = this.writeBuffer.shift()) != null) {
            this.writeStream.write(s.toString());
            this.writeStream.write("\n");
        }
        this.isWriting = false;
    }
    name;
    localLogLevel;
    constructor(name) {
        this.name = name;
        this.localLogLevel = Logging.globalLogLevel;
    }
    level(level) {
        if (level <= Logging.globalLogLevel && !Logging.forceGlobalLogLevel) {
            this.localLogLevel = level;
        }
        return this;
    }
    log(data, color) {
        if (typeof data == "object") {
            console.log(`${color}[${this.name}]${Logging.colorReset} Object`);
            console.log(data);
        }
        else {
            console.log(`${color}[${this.name}]${Logging.colorReset} ${data}`);
        }
        Logging.writeLogfile(this.name, data);
        return data;
    }
    info(data) {
        if (this.localLogLevel >= 1)
            this.log(data, Logging.colorInfo);
        return data;
    }
    debug(data) {
        if (this.localLogLevel >= 2)
            this.log(data, Logging.colorDebug);
        return data;
    }
    error(data) {
        if (this.localLogLevel >= 0)
            this.log(data, Logging.colorError);
        return data;
    }
}
function create(name) {
    return new Logging(name);
}
