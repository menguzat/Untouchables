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
    }

    connect() {
        this.photon.connectToRegionMaster('eu');
    }

    joinOrCreateRoom(roomName) {

        const room = this.roomList.find(room => room.name === roomName);
        if (room) {
            this.photon.joinRoom(roomName);
        } else {
            this.photon.createRoom(roomName, { maxPlayers: 10 });
        }
    }
    setOnPlayerPositionUpdate(callback) {
        this.onPlayerPositionUpdate = callback;
    }
    setOnJoinedRoom(callback) {
        this.onJoinedRoom = callback;
    }
    onActorJoin(actor) {
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
        if (code === 0) {
            const { id, actions } = data;
            this.onPlayerPositionUpdate(id, actions);
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
        this.joinOrCreateRoom("test");
    }

}

