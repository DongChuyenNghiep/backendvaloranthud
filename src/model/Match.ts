import { Team } from "./Team";
import { DataTypes, IAuthedData, IFormattedRoster, IFormattedRoundInfo, IFormattedScoreboard } from "./eventData";
import logging from "../util/Logging";
import { sendMatchToEventstream } from "../connector/eventStreamOutgoing";
import { ReplayLogging } from "../util/ReplayLogging";
import { Maps } from "../util/valorantInternalTranslator";
import { AuthTeam } from "../connector/websocketIncoming";
const Log = logging("Match");


export class Match {
    public groupCode;
    public isRanked: boolean = false;
    public isRunning: boolean = false;

    public roundNumber: number = 0;
    public roundPhase: string = "LOBBY";

    private teams: Team[] = [];
    private map: string = "";
    private spikePlanted = false;
    private spikeDetonated: boolean = false;
    private spikeDefused: boolean = false;

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

        this.startSendLoop();
    }

    startSendLoop() {
        setInterval(() => {
            sendMatchToEventstream(this);
        }, 1000);
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
                this.spikePlanted = false;
                this.spikeDetonated = false;
                this.spikeDefused = false;
            }

            if (this.roundPhase == "shopping" && (this.roundNumber == 13 || this.roundNumber >= 25)) {
                for (const team of this.teams) {
                    team.isAttacking = !team.isAttacking;
                }
            }

            if (this.roundPhase == "end") {
                for (const team of this.teams) {
                    team.resetRoundSpent();
                }
            }

            this.eventNumber++;
            return;
        } else if (data.type === DataTypes.MAP) {
            this.map = Maps[data.data as keyof typeof Maps];
            this.eventNumber++;
            return;
        } else if (data.type === DataTypes.SPIKE_PLANTED) {
            this.spikePlanted = true;
            this.eventNumber++;
            return;
        } else if (data.type === DataTypes.SPIKE_DETONATED) {
            this.spikeDetonated = true;
            for (const team of this.teams) {
                if (team.isAttacking) {
                    team.spikeDetonated();
                }
            }
            this.eventNumber++;
            return;
        } else if (data.type === DataTypes.SPIKE_DEFUSED) {
            this.spikeDefused = true;
            for (const team of this.teams) {
                if (!team.isAttacking) {
                    team.spikeDefused();
                }
            }
            this.eventNumber++;
            return;
        } else if (data.type === DataTypes.KILLFEED) {
            correctTeam = this.teams.find(team => team.hasTeamMember(data.obsName));

            if (correctTeam == null) {
                Log.info(`Received match data with invalid team for group code "${data.groupCode}"`);
                return;
            }

            correctTeam.receiveTeamSpecificData(data);
            this.eventNumber++;
            return;
        }

        correctTeam = this.teams[(data.data as IFormattedScoreboard).startTeam]

        if (correctTeam == null) {
            Log.info(`Received match data with invalid team for group code "${data.groupCode}"`);
            return;
        }

        this.eventNumber++;
        correctTeam.receiveTeamSpecificData(data);
    }

}