"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const websocketIncoming_1 = require("./connector/websocketIncoming");
const express_1 = __importDefault(require("express"));
const Logging_1 = __importDefault(require("./util/Logging"));
const MatchController_1 = require("./controller/MatchController");
const Log = (0, Logging_1.default)("Status");
const websocketIncoming = new websocketIncoming_1.WebsocketIncoming();
const app = (0, express_1.default)();
const port = 5101;
app.get("/status", (req, res) => {
    const status = { status: "UP", matchesRunning: MatchController_1.MatchController.getInstance().getMatchCount() };
    res.json(status);
});
app.listen(port, () => {
    Log.info(`Status available on port ${port}`);
});
