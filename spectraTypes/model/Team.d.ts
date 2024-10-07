import { IAuthedData } from "./eventData";
import { AuthTeam } from "../connector/websocketIncoming";
type RecordType = "detonated" | "defused" | "kills" | "timeout" | "lost";
export declare class Team {
    teamName: string;
    teamTricode: string;
    teamUrl: string;
    ingameTeamId: number;
    isAttacking: boolean;
    private hasHandledTeam;
    roundsWon: number;
    private spentThisRound;
    private roundRecord;
    private players;
    private playerCount;
    constructor(team: AuthTeam);
    receiveTeamSpecificData(data: IAuthedData): void;
    resetRoundSpecificValues(isSideSwitch: boolean): void;
    getSpentThisRound(): number;
    hasTeamMemberByName(playerName: string): boolean;
    hasTeamMemberBySearchName(playerSearchName: string): boolean;
    hasTeamMemberById(playerId: string): boolean;
    getPlayerCount(): number;
    switchSides(): void;
    setObservedPlayer(observedName: string): void;
    private processRosterData;
    private processScoreboardData;
    private processKillfeedData;
    private teamKills;
    private resetTeamKills;
    alivePlayers(): number;
    addRoundReason(reason: RecordType): void;
}
export {};
