"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isCompatibleVersion = isCompatibleVersion;
const semver_1 = __importDefault(require("semver"));
function isCompatibleVersion(version) {
    return semver_1.default.satisfies(version, `>=0.2.18 <0.3.0`);
}
