import WebSocket, {WebSocketServer} from "ws";
import { DataTypes, isAuthedData } from "../model/eventData";
import { MatchController } from "../controller/MatchController";
import logging from "../util/Logging";
const Log = logging("WebsocketIncoming");

export class WebsocketIncoming {
    wss: WebSocketServer;
    authedClients: ClientUser[] = [];
    matchController = MatchController.getInstance();

    constructor() {

        this.wss = new WebSocketServer({ 
            port: 5100,
            perMessageDeflate: {
                zlibDeflateOptions: {
                    chunkSize: 1024,
                    memLevel: 7,
                    level: 3
                },
                zlibInflateOptions: {
                    chunkSize: 10 * 1024
                },
                threshold: 1024
            },
            path: "/ingest"
        });

        this.wss.on(`connection`, (ws) => {
            const user = new ClientUser("New User", "Unknown Team", ws)

            ws.on('error', (e) => {
                Log.info(`${user.name} encountered a Websocket error.`);
            });

            ws.once('message', (msg) => {
                const json = JSON.parse(msg.toString());
                if (json.type === DataTypes.AUTH && this.matchController.createMatch(json)) {
                    ws.send(JSON.stringify({type: DataTypes.AUTH, value: true}));
                    user.name = json.obsName;
                    user.groupCode = json.groupCode;
                    this.authedClients.push(user);

                    Log.info(`Received VALID auth request from ${json.obsName}, using Group Code ${json.groupCode}`);
                    this.onAuthSuccess(user);
                } else {
                    ws.send(JSON.stringify({type: DataTypes.AUTH, value: false}));
                    ws.close();
                    Log.info(`Received BAD auth request from ${json.obsName}, using Group Code ${json.groupCode}`);
                }
            });

        });

        Log.info(`InhouseTracker Server listening on port 5100!`);
    }

    private onAuthSuccess(user: ClientUser) {
        user.ws.on("message", (msg: any) => {
            const data = JSON.parse(msg.toString());
            if (isAuthedData(data)) {
                this.matchController.receiveMatchData(data);
            }
        });
    }

}

class ClientUser {
    name: string;
    groupCode: string;
    ws: WebSocket;
    
    constructor(name: string, groupCode: string, ws: WebSocket) {
        this.name = name;
        this.groupCode = groupCode;
        this.ws = ws;
    }
}


export interface AuthTeam {
    name: string,
    tricode: string,
    url: string
}