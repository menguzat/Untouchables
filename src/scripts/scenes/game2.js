
// Import the classes
import { Player } from '../classes/Player.js';
import { PhotonManager } from '../classes/PhotonManager.js';

// Create the Babylon.js engine and scene
const canvas = document.getElementById('renderCanvas');
const engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true, adaptToDeviceRatio: true });
const scene = new BABYLON.Scene(engine);

let divFps = document.getElementById("debug");
let ping = 0;

await Ammo();

scene.enablePhysics(new BABYLON.Vector3(0, -20, 0), new BABYLON.AmmoJSPlugin(true, Ammo));



let localPlayer = null;
scene.clearColor = new BABYLON.Color3(0.8, 0.8, 0.8);

const groundRadius = 45;
const ground = BABYLON.MeshBuilder.CreateDisc('ground', { radius: groundRadius, tessellation: 64 }, scene);
const groundMaterial = new BABYLON.GridMaterial('groundMaterial', scene);
groundMaterial.mainColor = new BABYLON.Color3(0.4, 0.4, 0.4);
groundMaterial.lineColor = new BABYLON.Color3(0.2, 0.2, 0.2);
ground.material = groundMaterial;

ground.position.z = -1;

const groundPhysicsOptions = {
  mass: 0,
  friction: 0.5,
  restitution: 0.7,
  shape: BABYLON.PhysicsImpostor.CylinderImpostor,
  nativeOptions: {
    radiusTop: groundRadius,
    radiusBottom: groundRadius,
    height: 0.01,
    numSegments: 64,
    mass: 0
  }
};
ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.MeshImpostor, groundPhysicsOptions, scene);

ground.rotate(BABYLON.Axis.X, Math.PI / 2, BABYLON.Space.WORLD);

const camera = new BABYLON.ArcRotateCamera("camera1", Math.PI / 2, 2.1, -24, new BABYLON.Vector3(0, 0, 0), scene);
camera.setPosition(new BABYLON.Vector3(0, 35, 65));
camera.setTarget(new BABYLON.Vector3(0, 0, 20));
camera.fov = 0.9;

//camera.attachControl(canvas, true);
camera.inputs.removeByType("ArcRotateCameraKeyboardMoveInput");
camera.inputs.removeByType("ArcRotateCameraMouseWheelInput");
camera.inputs.removeByType("ArcRotateCameraPointersInput");

const light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 1, 0), scene);
const players = new Map();

const photonManager = new PhotonManager();

photonManager.setOnJoinedRoom(() => {
  const randomX = Math.random() * (groundRadius * 2) - groundRadius;
  const randomZ = Math.random() * (groundRadius * 2) - groundRadius;

  // Add the local player
  localPlayer = new Player(scene, photonManager.photon.myActor().actorNr, true, new BABYLON.Vector3(randomX, 0, randomZ)); players.set(photonManager.photon.myActor().actorNr.toString(), localPlayer);
  photonManager.localPlayerId = localPlayer.id;

  const otherActors = photonManager.photon.myRoomActors();
  if (localPlayer.id === photonManager.localPlayerId) {

    window.addEventListener('keydown', keydown);
    window.addEventListener('keyup', keyup);
  }
  console.log("my actor nr " + photonManager.photon.myActor().actorNr);
  for (var i = 1; i <= otherActors.length; i++) {
    console.log(otherActors[i].actorNr);
  }

  for (var actor in otherActors) {
    if (actor.toString() !== photonManager.photon.myActor().actorNr.toString()) {
      const cp = photonManager.photon.myRoom().getCustomProperties();
      for (const id in cp) {
        if (id == "pos-" + actor.toString()) {
          var otherPlayerPosition = cp[id];
          var otherPlayerRotation = cp["rot-" + actor.toString()];
          break;
        }
      }
      // Create the other player using their last known position
      const otherPlayer = new Player(scene, actor, false, new BABYLON.Vector3(otherPlayerPosition._x, otherPlayerPosition._y, otherPlayerPosition._z), new BABYLON.Quaternion(otherPlayerRotation._w, otherPlayerRotation._x, otherPlayerRotation._y, otherPlayerRotation._z));
      console.log(otherPlayer);
      players.set(actor.toString(), otherPlayer);
    }
  }
  photonManager.players = players;
});

photonManager.setOnActorJoin((actor) => {

  console.log("actor joined " + photonManager.photon.myActor().actorNr + " " + actor.actorNr);
  if (photonManager.photon.myActor().actorNr == actor.actorNr) {
    return;
  }


  const newposition = new BABYLON.Vector3(0, 0, 0);
  const newrotation = new BABYLON.Quaternion();

  // Check if there is an existing player with the same actor number
  const existingPlayer = photonManager.playerPositions.get(actor.actorNr.toString());
  if (existingPlayer) {
    newposition._x = existingPlayer.x;
    newposition._y = existingPlayer.y;
    newposition._z = existingPlayer.z;
    newrotation._w = existingPlayer.w;
    newrotation._x = existingPlayer.x;
    newrotation._y = existingPlayer.y;
    newrotation._z = existingPlayer.z;
  }


  // Set the custom properties for the joining actor
  photonManager.photon.myRoom().setCustomProperties({ [`pos-${actor.actorNr}`]: newposition, [`rot-${actor.actorNr}`]: newrotation }, { webForward: true });

  const newPlayer = new Player(scene, actor.actorNr, false, newposition, newrotation);
  players.set(actor.actorNr.toString(), newPlayer);

  photonManager.players.set(actor.actorNr.toString(), newPlayer);
  console.log("new player joined" + actor);
});

function detectCollision(player1, player2) {
  const body1 = player1.body;
  const body2 = player2.body;
  const transform1 = new Ammo.btTransform();
  body1.getMotionState().getWorldTransform(transform1);
  const transform2 = new Ammo.btTransform();
  body2.getMotionState().getWorldTransform(transform2);
  const origin1 = transform1.getOrigin();
  const origin2 = transform2.getOrigin();
  const dx = origin1.x() - origin2.x();
  const dy = origin1.y() - origin2.y();
  const dz = origin1.z() - origin2.z();
  const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
  const radius1 = player1.mesh.getBoundingInfo().boundingSphere.radiusWorld;
  const radius2 = player2.mesh.getBoundingInfo().boundingSphere.radiusWorld;
  return distance <= radius1 + radius2;
}


photonManager.setOnActorLeave((actor) => {
  const playerToRemove = players.get(actor.actorNr.toString());
  console.log(actor)
  console.log(playerToRemove)
  if (playerToRemove) {
    playerToRemove.destroy();
    players.delete(actor.actorNr.toString());
  }
  photonManager.players = players;
});
photonManager.connect();

setInterval(() => {
  ping = photonManager.getPing();
  photonManager.sendGameState();
}, 1000);
var collision = false;
setInterval(() => {
  if (localPlayer != null) {
    const position = localPlayer.mesh.position;
    const rotation = localPlayer.mesh.rotationQuaternion;

    if (localPlayer.id === photonManager.localPlayerId) {

      photonManager.players.forEach((player) => {


        if (localPlayer.id != player.id) {
          var otherPlayerColl = player;
          if (detectCollision(localPlayer, otherPlayerColl)) {
            photonManager.sendCollisionEvent(otherPlayerColl.id);
          }
        }

      });

      //photonManager.photon.myRoom().setCustomProperty("pos-" + photonManager.photon.myActor().actorNr.toString(), position);
      photonManager.sendPlayerPositionUpdate(localPlayer.id, position, rotation, localPlayer.body.getLinearVelocity(), localPlayer.body.getAngularVelocity());
    }
    // photonManager.photon.raiseEvent(Photon.LoadBalancing.Constants.EventCode.UserCustom, data);
  }


}, 10);
// Set up the main game loop
engine.runRenderLoop(() => {

  divFps.innerHTML = engine.getFps().toFixed() + " fps";
  divFps.innerHTML += "<br/>" + `${ping} ms`;


  scene.render();
});

photonManager.setOnEvent((event) => {
  if (event.Code === 3) {
    const gameState = event.Parameters;
    photonManager.receiveGameState(gameState);
    for (const playerState of gameState.players) {
      const player = players.get(playerState.id);
      if (player) {
        player.setState(playerState);
      }
    }
  }
  if (event.Code === 2) {
    const otherPlayerId = event.Parameters;
    photonManager.receiveCollisionEvent(otherPlayerId);
  }
});
photonManager.setOnPlayerPositionUpdate((id, position, rotation, linearVelocity, angularVelocity) => {
  const otherPlayer = players.get(id.toString());

  function interpolate(vector1, vector2, t) {
    return BABYLON.Vector3.Lerp(vector1, vector2, t);
  }

  function interpolateRotation(quaternion1, quaternion2, t) {
    return BABYLON.Quaternion.Slerp(quaternion1, quaternion2, t);
  }

  const interpolatePlayer = (player, newPosition, newRotation, interpolationTime, linearVelocity, angularVelocity) => {
    const currentTime = Date.now();
    const previousState = player.previousState;
    const targetState = { position: newPosition, rotation: newRotation, timestamp: currentTime };
    const smoothingFactor = 0.1; // You can adjust this value to control the smoothing


    if (previousState) {
      const deltaTime = currentTime - previousState.timestamp;
      const t = Math.min(deltaTime / interpolationTime, 1);
      const interpolatedPosition = interpolate(previousState.position, targetState.position, t);
      const interpolatedRotation = interpolateRotation(previousState.rotation, targetState.rotation, t);

      // Apply smoothing to the interpolated position and rotation
      const smoothedPosition = BABYLON.Vector3.Lerp(player.mesh.position, interpolatedPosition, smoothingFactor);
      const smoothedRotation = BABYLON.Quaternion.Slerp(player.mesh.rotationQuaternion, interpolatedRotation, smoothingFactor);

      player.updatePosition(smoothedPosition);
      player.updatePhysicsBodyRotation(smoothedRotation);
      player.updatePhysicsBody(smoothedPosition, smoothedRotation, linearVelocity, angularVelocity);

      // Update the previous state for the player
      player.previousState.position = interpolatedPosition.clone();
      player.previousState.rotation = interpolatedRotation.clone();
      player.previousState.timestamp = currentTime;
    } else {
      player.updatePosition(newPosition);
      player.updatePhysicsBodyRotation(newRotation);
      player.updatePhysicsBody(newPosition, newRotation, linearVelocity, angularVelocity);
      // Set the previous state for the player
      player.previousState = { position: newPosition.clone(), rotation: newRotation.clone(), timestamp: currentTime };
    }

    // Update the physics body position for other players
    if (player !== localPlayer) {
      player.updatePhysicsBody(newPosition, newRotation, linearVelocity, angularVelocity);
    }

    photonManager.playerPositions.set(player.id.toString(), { position: newPosition.clone(), rotation: newRotation.clone(), timestamp: Date.now() });
  };

  if (otherPlayer) {
    const newPosition = new BABYLON.Vector3(position._x, position._y, position._z);
    const newRotation = new BABYLON.Quaternion(rotation._x, rotation._y, rotation._z, rotation._w);
    const interpolationTime = 100; // Adjust this value to control the interpolation speed
    interpolatePlayer(otherPlayer, newPosition, newRotation, interpolationTime, linearVelocity, angularVelocity);
  } else if (localPlayer) {
    // Client-side prediction for the local player
    localPlayer.updatePhysicsBody(position, rotation, linearVelocity, angularVelocity);
  }
});



var keysActions = {
  "KeyW": 'acceleration',
  "KeyS": 'braking',
  "KeyA": 'left',
  "KeyD": 'right',
  "Space": 'drift',
  "ShiftLeft": 'boost',
  "KeyE": 'special',
  "KeyR": 'special2',
  "KeyQ": 'special3',
};

function keydown(e) {

  if (keysActions[e.code]) {
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
      localPlayer.actions['boost'] = true;
    } else {
      localPlayer.actions[keysActions[e.code]] = true;
    }
    localPlayer.updateActions(localPlayer.actions);

  }
}

function keyup(e) {

  console.log(localPlayer);
  if (keysActions[e.code]) {
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
      localPlayer.actions['boost'] = false;
    } else {
      localPlayer.actions[keysActions[e.code]] = false;
    }
    localPlayer.updateActions(localPlayer.actions);

  }
}

// Handle window resizing
window.addEventListener('resize', () => {
  engine.resize();
});

function hideLoadingScreen() {
  const loadingScreen = document.getElementById('loading-screen');
  loadingScreen.style.display = 'none';
}

setTimeout(hideLoadingScreen, 100);

function isMobileDevice() {
  return typeof window.orientation !== "undefined" || navigator.userAgent.indexOf("IEMobile") !== -1;
}

function updateOrientation() {
  if (!isMobileDevice()) return;
  const orientationWarning = document.getElementById('orientation-warning');
  const canvas = document.getElementById('renderCanvas');

  if (window.orientation === 90 || window.orientation === -90) {
    orientationWarning.style.display = 'none';
    canvas.style.display = 'block';
  } else {
    orientationWarning.style.display = 'block';
    canvas.style.display = 'none';
  }

  engine.resize();
}

// Listen for orientation changes
window.addEventListener('orientationchange', updateOrientation);

// Update the orientation when the page loads
updateOrientation();
