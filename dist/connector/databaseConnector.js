"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseConnector = exports.ValidityReasons = void 0;
require("dotenv").config();
const Logging_1 = __importDefault(require("../util/Logging"));
const Log = (0, Logging_1.default)("DatabaseConnector");
var ValidityReasons;
(function (ValidityReasons) {
    ValidityReasons["VALID"] = "";
    ValidityReasons["INVALID"] = "Invalid Key";
    ValidityReasons["EXPIRED"] = "Expired Key";
    ValidityReasons["UNKNOWN"] = "Unknown Error";
})(ValidityReasons || (exports.ValidityReasons = ValidityReasons = {}));
class DatabaseConnector {
    static async verifyAccessKey(key) {
        const res = await this.apiRequest(`system/validateAccessKey/${key}`, "get");
        if (res.status == 200) {
            const data = await res.json();
            Log.info(`Access key for organization ${data.id}:${data.name} verified`);
            return { valid: true, reason: ValidityReasons.VALID, organizationId: data.id };
        }
        else if (res.status == 401) {
            Log.info("An access key verification has failed");
            Log.debug("Access key was: " + key);
            return { valid: false, reason: ValidityReasons.INVALID };
        }
        else if (res.status == 403) {
            Log.info(`Access key checked but was expired`);
            Log.debug("Access key was: " + key);
            return { valid: false, reason: ValidityReasons.EXPIRED };
        }
        else {
            Log.error(`An unknown error occured during an access key verification. HTTP Code: ${res.status}`);
            return { valid: false, reason: ValidityReasons.UNKNOWN };
        }
    }
    static async registerMatch(match) {
        const res = await this.apiRequest(`system/match/${match.matchId}/register`, "post", {
            match: match,
        });
        if (res.status == 200) {
            return;
        }
        else {
            Log.error(`Register match encountered an error. HTTP Code: ${res.status}`);
            return;
        }
    }
    static async updateMatch(match) {
        const res = await this.apiRequest(`system/match/${match.matchId}/update`, "put", {
            match: match,
        });
        if (res.status == 200) {
            return;
        }
        else {
            Log.error(`Update match encountered an error. HTTP Code: ${res.status}`);
            return;
        }
    }
    static async completeMatch(match) {
        const res = await this.apiRequest(`system/match/${match.matchId}/complete`, "put", {
            match: match,
        });
        if (res.status == 200) {
            return;
        }
        else {
            Log.error(`Complete match encountered an error. HTTP Code: ${res.status}`);
            return;
        }
    }
    static async apiRequest(path, method, body) {
        const res = await fetch(process.env.BACKEND_URL + "/" + path, {
            method: method,
            body: JSON.stringify(body),
            headers: {
                "Content-Type": "application/json",
                "X-User-Token": process.env.BACKEND_TOKEN,
            },
        });
        if (res.status) {
            return res;
        }
        else {
            Log.error(`API request encountered an error. HTTP Code: ${res.status}`);
            throw new Error(`API request encountered an error. HTTP Code: ${res.status}`);
        }
    }
}
exports.DatabaseConnector = DatabaseConnector;
