"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = exports.AvailableAbilities = void 0;
const ValorantInternalTranslator_1 = require("../util/ValorantInternalTranslator");
const Logging_1 = __importDefault(require("../util/Logging"));
const AgentProperties_1 = require("../util/AgentProperties");
const Log = (0, Logging_1.default)("Player").level(1);
class AvailableAbilities {
    grenade = 0;
    ability1 = 0;
    ability2 = 0;
}
exports.AvailableAbilities = AvailableAbilities;
class AvailableAuxiliary {
    health = false;
    abilities = false;
    scoreboard = false;
}
class Player {
    name;
    tagline;
    riotId;
    searchName;
    position;
    locked = false;
    agentInternal = "";
    agentProper = "";
    isAlive = true;
    hasSpike = false;
    isObserved = false;
    health = 100;
    abilities = new AvailableAbilities();
    kills = 0;
    deaths = 0;
    assists = 0;
    kdRatio = 0;
    killsThisRound = 0;
    currUltPoints = 0;
    maxUltPoints = 0;
    ultReady = false;
    money = 0;
    moneySpent = 0;
    spentMoneyThisRound = false;
    armorName = ValorantInternalTranslator_1.Armor[0];
    highestWeapon = ValorantInternalTranslator_1.WeaponsAndAbilities["unknown"];
    teamKills = 0;
    headshotKills = 0;
    headshotRatio = 0;
    killsByWeaponsAndAbilities = {};
    killsOnEnemyPlayer = {};
    killsOnTeammatePlayer = {};
    assistsFromTeammate = {};
    scoreboardAvailable = false;
    auxiliaryAvailable = new AvailableAuxiliary();
    iconNameSuffix = "";
    constructor(data) {
        this.name = data.name;
        this.tagline = data.tagline;
        this.riotId = data.playerId;
        this.searchName = `${data.name} #${data.tagline}`;
        this.position = data.position;
        this.agentInternal = data.agentInternal;
        this.agentProper = ValorantInternalTranslator_1.Agents[data.agentInternal] || data.agentInternal;
        this.locked = data.locked;
    }
    onRosterUpdate(data) {
        this.name = data.name;
        this.tagline = data.tagline;
        this.agentInternal = data.agentInternal;
        this.agentProper = ValorantInternalTranslator_1.Agents[data.agentInternal] || data.agentInternal;
        this.locked = data.locked;
    }
    updateFromScoreboard(data) {
        if (data.kills > this.kills) {
            this.killsThisRound++;
        }
        this.runAgentSpecificScoreboardChecks(data);
        this.kills = data.kills;
        this.deaths = data.deaths;
        this.assists = data.assists;
        this.kdRatio = this.kills / this.deaths;
        this.currUltPoints = data.currUltPoints;
        this.maxUltPoints = data.maxUltPoints;
        this.ultReady = this.currUltPoints >= this.maxUltPoints;
        if (!this.spentMoneyThisRound && data.money < this.money) {
            this.spentMoneyThisRound = true;
        }
        if (this.spentMoneyThisRound && data.money != this.money) {
            this.moneySpent += this.money - data.money;
        }
        this.money = data.money;
        this.armorName = ValorantInternalTranslator_1.Armor[data.initialArmor];
        this.highestWeapon = ValorantInternalTranslator_1.WeaponsAndAbilities[data.scoreboardWeaponInternal];
        this.agentInternal = data.agentInternal;
        this.agentProper = ValorantInternalTranslator_1.Agents[data.agentInternal] || data.agentInternal;
        if (!data.isAlive && this.isAlive) {
            this.runAgentSpecificDeathChecks();
            this.health = 0;
        }
        if (data.isAlive && !this.isAlive) {
            this.health = 100;
        }
        this.isAlive = data.isAlive;
        this.hasSpike = data.hasSpike;
        this.scoreboardAvailable = true;
    }
    extractKillfeedInfo(data) {
        let existing = this.killsByWeaponsAndAbilities[data.weaponKillfeedInternal];
        if (existing) {
            this.killsByWeaponsAndAbilities[data.weaponKillfeedInternal] = existing++;
        }
        else {
            this.killsByWeaponsAndAbilities[data.weaponKillfeedInternal] = 1;
        }
        if (data.headshotKill == true) {
            this.headshotKills++;
            this.headshotRatio = this.headshotKills / this.kills;
        }
        if (data.isTeamkill == true) {
            this.teamKills++;
            let existing = this.killsOnTeammatePlayer[data.victim];
            if (existing) {
                this.killsOnTeammatePlayer[data.victim] = existing++;
            }
            else {
                this.killsOnTeammatePlayer[data.victim] = 1;
            }
        }
        if (data.isTeamkill == false) {
            let existing = this.killsOnEnemyPlayer[data.victim];
            if (existing) {
                this.killsOnEnemyPlayer[data.victim] = existing++;
            }
            else {
                this.killsOnEnemyPlayer[data.victim] = 1;
            }
        }
    }
    fallbackKillfeedExtraction(data, victim = false) {
        if (this.scoreboardAvailable || this.auxiliaryAvailable.scoreboard)
            return;
        if (victim) {
            this.isAlive = false;
            this.health = 0;
            this.deaths++;
        }
        else {
            this.runAgentSpecificScoreboardChecks({ kills: this.kills + 1 });
            this.kills++;
            this.killsThisRound++;
        }
    }
    fallbackAssistIncrement() {
        if (this.scoreboardAvailable || this.auxiliaryAvailable.scoreboard)
            return;
        this.runAgentSpecificScoreboardChecks({ assists: this.assists + 1 });
        this.assists++;
    }
    processObservedEvent(observedName) {
        if (this.searchName == observedName) {
            this.isObserved = true;
        }
        else {
            this.isObserved = false;
        }
    }
    updateFromAuxiliaryScoreboard(data) {
        if (this.scoreboardAvailable)
            return;
        this.runAgentSpecificScoreboardChecks(data);
        this.hasSpike = data.hasSpike;
        this.highestWeapon = ValorantInternalTranslator_1.WeaponsAndAbilities[data.scoreboardWeaponInternal];
        this.maxUltPoints = data.maxUltPoints;
        this.currUltPoints = data.currUltPoints;
        this.armorName = ValorantInternalTranslator_1.Armor[data.initialArmor];
        this.assists = data.assists;
        this.money = data.money;
        this.auxiliaryAvailable.scoreboard = true;
    }
    updateAbilities(data) {
        this.abilities = data;
        this.auxiliaryAvailable.abilities = true;
    }
    setHeatlh(health) {
        this.health = health;
        this.auxiliaryAvailable.health = true;
    }
    resetRoundSpecificValues(isSideSwitch) {
        this.resetKillsThisRound();
        this.resetMoneyThisRound();
        if (isSideSwitch) {
            this.money = 800;
        }
        this.scoreboardAvailable = false;
        this.auxiliaryAvailable.scoreboard = false;
        this.isAlive = true;
        this.health = 100;
    }
    getName() {
        return this.name;
    }
    getSearchName() {
        return this.searchName;
    }
    getPlayerId() {
        return this.riotId;
    }
    getAgentInternal() {
        return this.agentInternal;
    }
    checkIsAlive() {
        return this.isAlive;
    }
    getMoneySpent() {
        return this.moneySpent;
    }
    getKillsThisRound() {
        return this.killsThisRound;
    }
    resetKillsThisRound() {
        this.killsThisRound = 0;
    }
    resetMoneyThisRound() {
        this.moneySpent = 0;
        this.spentMoneyThisRound = false;
    }
    setAuxDisconnected() {
        this.auxiliaryAvailable = new AvailableAuxiliary();
        Log.info(`Auxiliary data for ${this.name} has been disconnected`);
    }
    setIconNameSuffix(suffix) {
        this.iconNameSuffix = suffix;
    }
    resetIconNameSuffix() {
        this.iconNameSuffix = "";
    }
    runAgentSpecificScoreboardChecks(data) {
        switch (this.agentProper) {
            case ValorantInternalTranslator_1.Agents.Smonk:
                this.cloveSpecificChecks(data);
                break;
            default:
                break;
        }
    }
    runAgentSpecificDeathChecks() {
        switch (this.agentProper) {
            case ValorantInternalTranslator_1.Agents.Rift:
            case ValorantInternalTranslator_1.Agents.Smonk:
                this.resetIconNameSuffix();
                break;
            default:
                break;
        }
    }
    cloveSpecificChecks(data) {
        if (data.currUltPoints == 0 && this.currUltPoints == this.maxUltPoints) {
            this.setIconNameSuffix(AgentProperties_1.IconNameSuffixes.CLOVE_ULTIMATE);
        }
        if (data.kills && data.kills > this.kills) {
            this.resetIconNameSuffix();
        }
        if (data.assists && data.assists > this.assists) {
            this.resetIconNameSuffix();
        }
    }
    setAstraTargeting(data) {
        if (this.agentProper === ValorantInternalTranslator_1.Agents.Rift) {
            if (data) {
                this.setIconNameSuffix(AgentProperties_1.IconNameSuffixes.ASTRA_TARGETING);
            }
            else {
                this.resetIconNameSuffix();
            }
        }
    }
}
exports.Player = Player;
