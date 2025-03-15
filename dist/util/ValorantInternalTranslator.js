"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ranks = exports.Armor = exports.Maps = exports.Agents = exports.WeaponCosts = exports.WeaponsAndAbilities = void 0;
var WeaponsAndAbilities;
(function (WeaponsAndAbilities) {
    WeaponsAndAbilities["TX_Hud_Pistol_Classic"] = "Classic";
    WeaponsAndAbilities["TX_Hud_Pistol_Glock_S"] = "Classic";
    WeaponsAndAbilities["TX_Hud_Pistol_Slim"] = "Shorty";
    WeaponsAndAbilities["TX_Hud_Pistol_SawedOff_S"] = "Shorty";
    WeaponsAndAbilities["TX_Hud_Pistol_AutoPistol"] = "Frenzy";
    WeaponsAndAbilities["TX_Hud_AutoPistol"] = "Frenzy";
    WeaponsAndAbilities["TX_Hud_Pistol_Luger"] = "Ghost";
    WeaponsAndAbilities["TX_Hud_Pistol_Luger_S"] = "Ghost";
    WeaponsAndAbilities["TX_Hud_Pistol_Sheriff"] = "Sheriff";
    WeaponsAndAbilities["TX_Hud_Pistol_Revolver_S"] = "Sheriff";
    WeaponsAndAbilities["TX_Hud_Shotguns_Pump"] = "Bucky";
    WeaponsAndAbilities["TX_Hud_Pump"] = "Bucky";
    WeaponsAndAbilities["TX_Hud_Shotguns_Persuader"] = "Judge";
    WeaponsAndAbilities["TX_Hud_Shotguns_Spas12_S"] = "Judge";
    WeaponsAndAbilities["TX_Hud_SMGs_Vector"] = "Stinger";
    WeaponsAndAbilities["TX_Hud_Vector"] = "Stinger";
    WeaponsAndAbilities["TX_Hud_SMGs_Ninja"] = "Spectre";
    WeaponsAndAbilities["TX_Hud_SMG_MP5_S"] = "Spectre";
    WeaponsAndAbilities["TX_Hud_Rifles_Burst"] = "Bulldog";
    WeaponsAndAbilities["TX_Hud_Burst"] = "Bulldog";
    WeaponsAndAbilities["TX_Hud_Rifles_DMR"] = "Guardian";
    WeaponsAndAbilities["tx_hud_dmr"] = "Guardian";
    WeaponsAndAbilities["TX_Hud_Rifles_Ghost"] = "Phantom";
    WeaponsAndAbilities["TX_Hud_Assault_AR10A2_S"] = "Phantom";
    WeaponsAndAbilities["TX_Hud_Rifles_Volcano"] = "Vandal";
    WeaponsAndAbilities["TX_Hud_Volcano"] = "Vandal";
    WeaponsAndAbilities["TX_Hud_Sniper_Bolt"] = "Marshal";
    WeaponsAndAbilities["TX_Hud_Sniper_BoltAction_S"] = "Marshal";
    WeaponsAndAbilities["TX_Hud_Sniper_Operater"] = "Operator";
    WeaponsAndAbilities["TX_Hud_Operator"] = "Operator";
    WeaponsAndAbilities["TX_Hud_Sniper_DoubleSniper"] = "Outlaw";
    WeaponsAndAbilities["TX_Hud_DoubleSniper"] = "Outlaw";
    WeaponsAndAbilities["TX_Hud_LMG"] = "Ares";
    WeaponsAndAbilities["TX_Hud_HMG"] = "Odin";
    WeaponsAndAbilities["knife"] = "Knife";
    WeaponsAndAbilities["TX_Hud_Knife_Standard_S"] = "Knife";
    WeaponsAndAbilities["unknown"] = "Unknown";
    WeaponsAndAbilities["TX_Breach_FusionBlast"] = "Aftershock";
    WeaponsAndAbilities["TX_Sarge_MolotovLauncher"] = "Incendiary";
    WeaponsAndAbilities["TX_Sarge_OrbitalStrike"] = "Orbital Strike (ULT)";
    WeaponsAndAbilities["TX_Pheonix_FireWall"] = "Blaze";
    WeaponsAndAbilities["TX_Pheonix_Molotov"] = "Hot Hands";
    WeaponsAndAbilities["TX_Hunter_ShockArrow"] = "Shock Bolt";
    WeaponsAndAbilities["TX_Hunter_BowBlast"] = "Hunters Fury";
    WeaponsAndAbilities["TX_Hud_Deadeye_Q_Pistol"] = "Headhunter";
    WeaponsAndAbilities["TX_Hud_Deadeye_X_GiantSlayer"] = "Tour de Force (ULT)";
    WeaponsAndAbilities["TX_Cable_FishingHook"] = "Annihilation (ULT)";
    WeaponsAndAbilities["TX_Hud_Wushu_X_Dagger"] = "Blade Storm (ULT)";
    WeaponsAndAbilities["TX_Neon_Ult"] = "Overdrive (ULT)";
    WeaponsAndAbilities["TX_Thorne_Heal"] = "Resurrection (ULT)";
    WeaponsAndAbilities["TX_Gumshoe_Tripwire"] = "Trapwire";
    WeaponsAndAbilities["TX_Gren_Icon"] = "Frag/ment";
    WeaponsAndAbilities["TX_Aggrobot_Bubbles"] = "Mosh Pit";
    WeaponsAndAbilities["TX_KJ_Bees"] = "Nanoswarm";
    WeaponsAndAbilities["tx_KJ_turret"] = "Turret";
    WeaponsAndAbilities["TX_Clay_Boomba"] = "Boom bot";
    WeaponsAndAbilities["TX_Clay_ClusterBomb"] = "Paint Shells";
    WeaponsAndAbilities["TX_Clay_RocketLauncher"] = "Show stopper (ULT)";
    WeaponsAndAbilities["TX_Guide4"] = "Trail blazer";
    WeaponsAndAbilities["TX_Pandemic_AcidLauncher"] = "Snake bite";
})(WeaponsAndAbilities || (exports.WeaponsAndAbilities = WeaponsAndAbilities = {}));
var WeaponCosts;
(function (WeaponCosts) {
    WeaponCosts[WeaponCosts["Knife"] = 0] = "Knife";
    WeaponCosts[WeaponCosts["Classic"] = 0] = "Classic";
    WeaponCosts[WeaponCosts["Shorty"] = 300] = "Shorty";
    WeaponCosts[WeaponCosts["Frenzy"] = 450] = "Frenzy";
    WeaponCosts[WeaponCosts["Ghost"] = 500] = "Ghost";
    WeaponCosts[WeaponCosts["Sheriff"] = 800] = "Sheriff";
    WeaponCosts[WeaponCosts["Bucky"] = 850] = "Bucky";
    WeaponCosts[WeaponCosts["Judge"] = 1850] = "Judge";
    WeaponCosts[WeaponCosts["Stinger"] = 1100] = "Stinger";
    WeaponCosts[WeaponCosts["Spectre"] = 1600] = "Spectre";
    WeaponCosts[WeaponCosts["Bulldog"] = 2050] = "Bulldog";
    WeaponCosts[WeaponCosts["Guardian"] = 2250] = "Guardian";
    WeaponCosts[WeaponCosts["Phantom"] = 2900] = "Phantom";
    WeaponCosts[WeaponCosts["Vandal"] = 2900] = "Vandal";
    WeaponCosts[WeaponCosts["Marshal"] = 950] = "Marshal";
    WeaponCosts[WeaponCosts["Operator"] = 4700] = "Operator";
    WeaponCosts[WeaponCosts["Outlaw"] = 2400] = "Outlaw";
    WeaponCosts[WeaponCosts["Ares"] = 1600] = "Ares";
    WeaponCosts[WeaponCosts["Odin"] = 3200] = "Odin";
})(WeaponCosts || (exports.WeaponCosts = WeaponCosts = {}));
var Agents;
(function (Agents) {
    Agents[""] = "No Agent selected";
    Agents["Clay_PC_C"] = "Raze";
    Agents["Clay"] = "Raze";
    Agents["TX_Killfeed_Raze"] = "Clay";
    Agents["Pandemic_PC_C"] = "Viper";
    Agents["Pandemic"] = "Viper";
    Agents["TX_Killfeed_Viper"] = "Pandemic";
    Agents["Wraith_PC_C"] = "Omen";
    Agents["Wraith"] = "Omen";
    Agents["TX_Killfeed_Omen"] = "Wraith";
    Agents["Hunter_PC_C"] = "Sova";
    Agents["Hunter"] = "Sova";
    Agents["TX_Killfeed_Sova"] = "Hunter";
    Agents["Thorne_PC_C"] = "Sage";
    Agents["Thorne"] = "Sage";
    Agents["TX_Killfeed_Sage"] = "Thorne";
    Agents["Phoenix_PC_C"] = "Phoenix";
    Agents["Phoenix"] = "Phoenix";
    Agents["TX_Killfeed_Phoenix"] = "Phoenix";
    Agents["Wushu_PC_C"] = "Jett";
    Agents["Wushu"] = "Jett";
    Agents["TX_Killfeed_Jett"] = "Wushu";
    Agents["Gumshoe_PC_C"] = "Cypher";
    Agents["Gumshoe"] = "Cypher";
    Agents["TX_Killfeed_Cypher"] = "Gumshoe";
    Agents["Sarge_PC_C"] = "Brimstone";
    Agents["Sarge"] = "Brimstone";
    Agents["TX_Killfeed_Brimstone"] = "Sarge";
    Agents["Breach_PC_C"] = "Breach";
    Agents["Breach"] = "Breach";
    Agents["TX_Killfeed_Breach"] = "Breach";
    Agents["Vampire_PC_C"] = "Reyna";
    Agents["Vampire"] = "Reyna";
    Agents["TX_Killfeed_Reyna"] = "Vampire";
    Agents["Killjoy_PC_C"] = "Killjoy";
    Agents["Killjoy"] = "Killjoy";
    Agents["TX_Killfeed_Killjoy"] = "Killjoy";
    Agents["Guide_PC_C"] = "Skye";
    Agents["Guide"] = "Skye";
    Agents["TX_Killfeed_Skye"] = "Guide";
    Agents["Stealth_PC_C"] = "Yoru";
    Agents["Stealth"] = "Yoru";
    Agents["TX_Killfeed_Yoru"] = "Stealth";
    Agents["Rift_PC_C"] = "Astra";
    Agents["Rift"] = "Astra";
    Agents["TX_Killfeed_Astra"] = "Rift";
    Agents["Grenadier_PC_C"] = "KAYO";
    Agents["Grenadier"] = "KAYO";
    Agents["TX_Killfeed_KAYO"] = "Grenadier";
    Agents["Deadeye_PC_C"] = "Chamber";
    Agents["Deadeye"] = "Chamber";
    Agents["TX_Killfeed_Chamber"] = "Deadeye";
    Agents["Sprinter_PC_C"] = "Neon";
    Agents["Sprinter"] = "Neon";
    Agents["TX_Killfeed_Neon"] = "Sprinter";
    Agents["BountyHunter_PC_C"] = "Fade";
    Agents["BountyHunter"] = "Fade";
    Agents["TX_Killfeed_Fade"] = "BountyHunter";
    Agents["Mage_PC_C"] = "Harbor";
    Agents["Mage"] = "Harbor";
    Agents["TX_Killfeed_Harbor"] = "Mage";
    Agents["Aggrobot_PC_C"] = "Gekko";
    Agents["Aggrobot"] = "Gekko";
    Agents["TX_Killfeed_Gekko"] = "Aggrobot";
    Agents["Cable_PC_C"] = "Deadlock";
    Agents["Cable"] = "Deadlock";
    Agents["TX_Killfeed_Deadlock"] = "Cable";
    Agents["Sequoia_PC_C"] = "Iso";
    Agents["Sequoia"] = "Iso";
    Agents["TX_Killfeed_Iso"] = "Sequoia";
    Agents["Smonk_PC_C"] = "Clove";
    Agents["Smonk"] = "Clove";
    Agents["TX_Killfeed_Clove"] = "Smonk";
    Agents["Nox_PC_C"] = "Vyse";
    Agents["Nox"] = "Vyse";
    Agents["TX_Killfeed_Vyse"] = "Nox";
    Agents["Cashew_PC_C"] = "Tejo";
    Agents["Cashew"] = "Tejo";
    Agents["TX_Killfeed_Tejo"] = "Cashew";
    Agents["Terra_PC_C"] = "Waylay";
    Agents["Terra"] = "Waylay";
    Agents["TX_Killfeed_Waylay"] = "Terra";
})(Agents || (exports.Agents = Agents = {}));
var Maps;
(function (Maps) {
    Maps["Infinityy"] = "Abyss";
    Maps["Triad"] = "Haven";
    Maps["Duality"] = "Bind";
    Maps["Bonsai"] = "Split";
    Maps["Ascent"] = "Ascent";
    Maps["Port"] = "Icebox";
    Maps["Foxtrot"] = "Breeze";
    Maps["Canyon"] = "Fracture";
    Maps["Pitt"] = "Pearl";
    Maps["Jam"] = "Lotus";
    Maps["Juliett"] = "Sunset";
    Maps["Range"] = "Practice Range";
    Maps["HURM_Alley"] = "District";
    Maps["HURM_Yard"] = "Piazza ";
    Maps["HURM_Bowl"] = "Kasbah";
    Maps["HURM_Helix"] = "Drift";
})(Maps || (exports.Maps = Maps = {}));
exports.Armor = ["None", "Light", "Heavy", "None", "Regen"];
exports.ranks = [
    "Unranked",
    "",
    "",
    "Iron_01",
    "Iron_02",
    "Iron_03",
    "Bronze_01",
    "Bronze_02",
    "Bronze_03",
    "Silver_01",
    "Silver_02",
    "Silver_03",
    "Gold_01",
    "Gold_02",
    "Gold_03",
    "Platinum_01",
    "Platinum_02",
    "Platinum_03",
    "Diamond_01",
    "Diamond_02",
    "Diamond_03",
    "Ascendant_1",
    "Ascendant_2",
    "Ascendant_3",
    "Immortal_01",
    "Immortal_02",
    "Immortal_03",
    "Radiant",
];
