"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToolsData = void 0;
class ToolsData {
    seriesInfo = {
        needed: 1,
        wonLeft: 0,
        wonRight: 0,
        mapInfo: [],
    };
    seedingInfo = {
        left: "",
        right: "",
    };
    tournamentInfo = {
        name: "",
        logoUrl: "",
        backdropUrl: "",
        enabled: false,
    };
    timeoutDuration = 60;
    constructor(init) {
        Object.assign(this, init);
        if (this.tournamentInfo.backdropUrl != "" ||
            this.tournamentInfo.logoUrl != "" ||
            this.tournamentInfo.name != "") {
            this.tournamentInfo.enabled = true;
        }
        else {
            this.tournamentInfo.enabled = false;
        }
    }
}
exports.ToolsData = ToolsData;
