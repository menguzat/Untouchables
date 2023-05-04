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

    sendPlayerPositionUpdate(id, position, rotation) {
        this.photon.raiseEvent(1, { id: id, position: position, rotation: rotation }, { receivers: Photon.LoadBalancing.Constants.ReceiverGroup.Others });
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
    if (code === 1) { // Add this
            
            const { id, position, rotation  } = data;


            //this.playerPositions.set(id, position, rotation);
            this.onPlayerPositionUpdate(id,  position, rotation);

        }
        if (code === 2) {
            const { idA, idB, positionA, positionB, linearVelocityA, linearVelocityB } = data;
            const playerA = players.get(idA.toString());
            const playerB = players.get(idB.toString());
        
            if (playerA && playerB) {
              // Update positions and linear velocities for both players
              playerA.updatePhysicsBody(positionA, playerA.mesh.rotationQuaternion);
              playerB.updatePhysicsBody(positionB, playerB.mesh.rotationQuaternion);
        
              const ammoLinearVelocityA = new Ammo.btVector3(
                linearVelocityA._x, linearVelocityA._y, linearVelocityA._z);
              const ammoLinearVelocityB = new Ammo.btVector3(
                linearVelocityB._x, linearVelocityB._y, linearVelocityB._z);
        
              playerA.body.setLinearVelocity(ammoLinearVelocityA);
              playerB.body.setLinearVelocity(ammoLinearVelocityB);
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
        this.joinOrCreateRoom("test23");
    }
    getPing() {
        this.photon.updateRtt("test23");
        return this.photon.getRtt();
    }
}