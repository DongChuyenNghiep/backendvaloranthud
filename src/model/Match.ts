import { Team } from "./Team";
import { DataTypes, IAuthedData, IFormattedRoster, IFormattedRoundInfo, IFormattedScore, IFormattedScoreboard } from "./eventData";
import logging from "../util/Logging";
import { ReplayLogging } from "../util/ReplayLogging";
import { Maps } from "../util/valorantInternalTranslator";
import { AuthTeam } from "../connector/websocketIncoming";
const Log = logging("Match");


export class Match {
    private switchRound = 13;
    private firstOtRound = 25;

    public groupCode;
    public isRanked: boolean = false;
    public isRunning: boolean = false;

    public roundNumber: number = 0;
    public roundPhase: string = "LOBBY";

    private teams: Team[] = [];
    private map: string = "";
    private spikeState: SpikeStates = { planted: false, detonated: false, defused: false };

    public ranks: { team1: string[], team2: string[] } = { team1: [], team2: [] };

    private replayLog: ReplayLogging;
    public eventNumber: number = 0;

    constructor(groupCode: string, leftTeam: AuthTeam, rightTeam: AuthTeam, isRanked: boolean = false) {
        this.groupCode = groupCode;

        this.replayLog = new ReplayLogging(this.groupCode);

        const firstTeam = new Team(leftTeam);
        const secondTeam = new Team(rightTeam);

        this.teams.push(firstTeam);
        this.teams.push(secondTeam);

        this.isRanked = isRanked;
    }

    isValidTeam(teamName: string) {
        for (const team of this.teams) {
            if (team.teamName === teamName.toUpperCase()) return true;
        }
        return false;
    }

    setRanks(data: any) {
        this.ranks = data.ranks;
    }

    receiveMatchSpecificData(data: IAuthedData) {
        this.replayLog.write(data);

        let correctTeam = null;
        if (data.type == DataTypes.MATCH_START) {
            this.isRunning = true;
            this.eventNumber++;
            return;
        } else if (data.type == DataTypes.ROUND_INFO) {
            this.roundNumber = (data.data as IFormattedRoundInfo).roundNumber;
            this.roundPhase = (data.data as IFormattedRoundInfo).roundPhase;

            if (this.roundPhase == "shopping") {
                this.spikeState.planted = false;
                this.spikeState.detonated = false;
                this.spikeState.defused = false;

                if (this.roundNumber == this.switchRound || this.roundNumber >= this.firstOtRound) {
                    for (const team of this.teams) {
                        team.switchSides();
                    }
                }
            }

            if (this.roundPhase == "end") {
                // Wait for 75ms to ensure detonation event has been processed (was about 9ms behind round end event in testing)
                setTimeout(() => {
                    const leftTeam = this.teams[0];
                    const rightTeam = this.teams[1];

                    leftTeam.processRoundEnd(this.spikeState, rightTeam.getPlayerCount());
                    rightTeam.processRoundEnd(this.spikeState, leftTeam.getPlayerCount());

                    leftTeam.resetRoundSpent();
                    rightTeam.resetRoundSpent();
                }, 75);
            }

            this.eventNumber++;
            return;
        } else if (data.type === DataTypes.MAP) {
            this.map = Maps[data.data as keyof typeof Maps];
            this.eventNumber++;
            return;
        } else if (data.type === DataTypes.SPIKE_PLANTED) {
            this.spikeState.planted = true;
            this.eventNumber++;
            return;
        } else if (data.type === DataTypes.SPIKE_DETONATED) {
            this.spikeState.detonated = true;
            this.eventNumber++;
            return;
        } else if (data.type === DataTypes.SPIKE_DEFUSED) {
            this.spikeState.defused = true;
            this.eventNumber++;
            return;
        } else if (data.type === DataTypes.KILLFEED) {
            correctTeam = this.teams.find(team => team.hasTeamMemberByName(data.obsName));

            if (correctTeam == null) {
                Log.info(`Received match data with invalid team for group code "${data.groupCode}"`);
                Log.info(`Data: ${data}`);
                return;
            }

            correctTeam.receiveTeamSpecificData(data);
            this.eventNumber++;
            return;
        } else if (data.type === DataTypes.OBSERVING) {
            for (const team of this.teams) {
                team.setObservedPlayer(data.data as string);
            }
        }

        correctTeam = this.teams[(data.data as IFormattedScoreboard).startTeam]

        if (correctTeam == null) {
            Log.info(`Received match data with invalid team for group code "${data.groupCode}"`);
            Log.info(`Data: ${data}`);
            return;
        }

        this.eventNumber++;
        correctTeam.receiveTeamSpecificData(data);
    }

}

export interface SpikeStates {
    planted: boolean;
    detonated: boolean;
    defused: boolean;
}