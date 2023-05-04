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
  // Add the local player
  localPlayer = new Player(scene, photonManager.photon.myActor().actorNr, true, new BABYLON.Vector3(0, 0, 0));
  players.set(photonManager.photon.myActor().actorNr.toString(), localPlayer);

  const otherActors = photonManager.photon.myRoomActors();
  console.log(otherActors);

  window.addEventListener('keydown', keydown);
  window.addEventListener('keyup', keyup);

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
});

photonManager.setOnActorJoin((actor) => {

  console.log("actor joined " + photonManager.photon.myActor().actorNr + " " + actor.actorNr);
  if (photonManager.photon.myActor().actorNr === actor.actorNr) {
    return;
  }


  const newposition= new BABYLON.Vector3(0, 0, 0);
  const newrotation=new BABYLON.Quaternion();

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

  const newPlayer = new Player(scene, actor.actorNr, false,newposition,newrotation);
  players.set(actor.actorNr.toString(), newPlayer);
  console.log("new player joined" + actor);
});

photonManager.setOnActorLeave((actor) => {
  const playerToRemove = players.get(actor.actorNr.toString());
  console.log(actor)
  console.log(playerToRemove)
  if (playerToRemove) {
    playerToRemove.destroy();
    players.delete(actor);
  }
});
photonManager.connect();

setInterval(() => {
  ping = photonManager.getPing();
}, 1000);

setInterval(()=> {
  if (localPlayer != null) {
    const position = localPlayer.mesh.position;
    const rotation = localPlayer.mesh.rotationQuaternion;
    const data = { id: photonManager.photon.myActor().actorNr, actions: localPlayer.actions, position: position, rotation: rotation };

    //photonManager.photon.myRoom().setCustomProperty("pos-" + photonManager.photon.myActor().actorNr.toString(), position);
    photonManager.sendPlayerPositionUpdate(photonManager.photon.myActor().actorNr, position, rotation);
   // photonManager.photon.raiseEvent(Photon.LoadBalancing.Constants.EventCode.UserCustom, data);
  }

  players.forEach((playerA, idA) => {
    players.forEach((playerB, idB) => {
      if (idA !== idB && playerA.mesh.intersectsMesh(playerB.mesh)) {
        // When a collision occurs, raise a collision event
        const collisionData = {
          idA: idA,
          idB: idB,
          positionA: playerA.mesh.position,
          positionB: playerB.mesh.position,
          linearVelocityA: playerA.body.getLinearVelocity(),
          linearVelocityB: playerB.body.getLinearVelocity()
        };

        photonManager.photon.raiseEvent(
          2,
          collisionData,
          { receivers: Photon.LoadBalancing.Constants.ReceiverGroup.All }
        );
      }
    });
  }, 20);
})
// Set up the main game loop
engine.runRenderLoop(() => {
  
  divFps.innerHTML = engine.getFps().toFixed() + " fps";
  divFps.innerHTML += "<br/>" + `${ping} ms`;

  
  scene.render();
});

photonManager.setOnPlayerPositionUpdate((id,  position, rotation) => {
  
  if (id.toString() == photonManager.photon.myActor().actorNr.toString()) return;

  photonManager.playerPositions.set(id.toString(), { position: position, rotation: rotation, timestamp: Date.now() });

  const otherPlayer = players.get(id.toString());

  // Interpolation
  const interpolate = (start, end, t) => {
    var newstart = new BABYLON.Vector3(start._x, start._y, start._z);
    return BABYLON.Vector3.Lerp(newstart, end, t);
  };

  const interpolateRotation = (start, end, t) => {
    return BABYLON.Quaternion.Slerp(start, end, t);
  };

 const interpolatePlayer = (player, newPosition, newRotation, interpolationTime) => {
  const currentTime = Date.now();
  const previousState = player.previousState;
  const targetState = { position: newPosition, rotation: newRotation, timestamp: currentTime };

  if (previousState) {
    const deltaTime = currentTime - previousState.timestamp;
    const t = Math.min(deltaTime / interpolationTime, 1);
    const interpolatedPosition = interpolate(previousState.position, targetState.position, t);
    const interpolatedRotation = interpolateRotation(previousState.rotation, targetState.rotation, t);

    const positionDelta = interpolatedPosition.subtract(player.mesh.position);
    const linearVelocity = positionDelta.scale(1 / deltaTime);
    const ammoLinearVelocity = new Ammo.btVector3(linearVelocity.x, linearVelocity.y, linearVelocity.z);
    player.body.setLinearVelocity(ammoLinearVelocity);

    const rotationDelta = interpolatedRotation.subtract(player.mesh.rotationQuaternion.toEulerAngles());
    const angularVelocity = rotationDelta.scale(1 / deltaTime);
    const ammoAngularVelocity = new Ammo.btVector3(angularVelocity.x, angularVelocity.y, angularVelocity.z);
    player.body.setAngularVelocity(ammoAngularVelocity);

  } else {
    player.updatePhysicsBody(newPosition, newRotation);
  }

  player.previousState = targetState;
};
  // Client-side prediction
  if (otherPlayer) {
    const newPosition = new BABYLON.Vector3(position._x, position._y, position._z);
    const newRotation = new BABYLON.Quaternion(rotation._x, rotation._y, rotation._z, rotation._w);
    const interpolationTime = 100; // Adjust this value to control the interpolation speed

    interpolatePlayer(otherPlayer, newPosition, newRotation, interpolationTime);
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
  }
}

function keyup(e) {
  if (keysActions[e.code]) {
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
      localPlayer.actions['boost'] = false;
    } else {
      localPlayer.actions[keysActions[e.code]] = false;
    }
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
