export class PhotonManager {
    constructor() {
        this.photon = new Photon.LoadBalancing.LoadBalancingClient(
            Photon.ConnectionProtocol.Wss,
            '63fffbcc-f982-4abc-96da-992658a15736', // Replace with your Photon App ID
            '1.0' // Version
        );
        this.photon.setLogLevel(Exitgames.Common.Logger.Level.INFO);
        this.photon.onEvent = this.onEvent.bind(this);
        this.photon.onError = this.onError.bind(this);
        this.photon.onStateChange = this.onStateChange.bind(this);
        this.photon.onActorJoin = this.onActorJoin.bind(this);
        this.photon.onActorLeave = this.onActorLeave.bind(this);
        this.photon.onRoomList = this.onRoomList.bind(this);
        this.playerPositions = new Map();
        this.players = new Map();
        this.localPlayerId=0;

    }
    connect() {
        this.photon.connectToRegionMaster('eu');
    }
    joinOrCreateRoom(roomName) {
        const room = this.roomList.find(room => room.name === roomName);
        if (room) {
            console.log("room found, joining");
            this.photon.joinRoom(roomName);
        } else {
            console.log("room not found,creating");
            this.photon.createRoom(roomName, {
                maxPlayers: 10, broadcastPropsChangeToAll: true
            });
        }
    }

    sendPlayerPositionUpdate(id, position, rotation, linearVelocity, angularVelocity) {
        this.photon.raiseEvent(1, { id: id, position: position, rotation: rotation, linearVelocity: linearVelocity, angularVelocity:angularVelocity }, { receivers: Photon.LoadBalancing.Constants.ReceiverGroup.Others });
        this.photon.myRoom().setCustomProperties({ ["pos-" + id.toString()]: position, ["rot-" + id.toString()]: rotation }, { webForward: true });
    }
    setOnPlayerPositionUpdate(callback) {

        this.onPlayerPositionUpdate = callback;
    }
    setOnJoinedRoom(callback) {
        this.onJoinedRoom = callback;
    }
    onActorJoin(actor) {
        // If the joining actor is the current client, no need to set its custom properties

        if (this.actorJoinCallback) {
            this.actorJoinCallback(actor);
        }
    }
    onActorLeave(actor) {
        if (this.actorLeaveCallback) {
            this.actorLeaveCallback(actor);
        }
    }
    setOnActorJoin(callback) {
        this.actorJoinCallback = callback;
    }
    setOnActorLeave(callback) {
        this.actorLeaveCallback = callback;
    }
    onEvent(code, data) {
        // Handle Photon events here
    if (code == 1) { // Add this
            
            const { id, position, rotation, linearVelocity, angularVelocity  } = data;
            if(id.toString() !== this.photon.myActor().actorNr.toString()) {
                // Update the position only for remote players
                this.onPlayerPositionUpdate(id,  position, rotation, linearVelocity,angularVelocity);
            }

        }
       
    }
    onError(errorCode, errorMsg) {
        console.error(`Photon Error: ${errorCode} - ${errorMsg}`);
    }
    onStateChange(state) {
        if (state === Photon.LoadBalancing.LoadBalancingClient.State.JoinedLobby) {
            // this.joinOrCreateRoom('test');
        }
        else if (state === Photon.LoadBalancing.LoadBalancingClient.State.Joined) {
            this.onJoinedRoom();

        }
    }
    onRoomList(rooms) {
        console.log(rooms);
        this.roomList = rooms;
        this.joinOrCreateRoom("test232");
    }
    getPing() {
        this.photon.updateRtt("test232");
        return this.photon.getRtt();
    }
}

