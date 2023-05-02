// Import the classes
import { Player } from './classes/Player.js';
import { PhotonManager } from './classes/PhotonManager.js';

// Create the Babylon.js engine and scene
const canvas = document.getElementById('renderCanvas');
const engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true, adaptToDeviceRatio: true });
const scene = new BABYLON.Scene(engine);

await Ammo();

scene.enablePhysics(new BABYLON.Vector3(0, -20, 0), new BABYLON.AmmoJSPlugin());

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
        if(id=="pos-"+actor.toString()){
             var otherPlayerPosition  = cp[id];
             var otherPlayerRotation = cp["rot-"+actor.toString()];
          break;
        }
      }
      // Create the other player using their last known position
      const otherPlayer = new Player(scene, actor, false, new BABYLON.Vector3(otherPlayerPosition._x, otherPlayerPosition._y, otherPlayerPosition._z),new BABYLON.Quaternion(otherPlayerRotation._w,otherPlayerRotation._x, -otherPlayerRotation._y, otherPlayerRotation._z) );
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
  const newPlayer = new Player(scene, actor.actorNr, false);
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

// Set up the main game loop
engine.runRenderLoop(() => {
  if (localPlayer != null) {
    const position = localPlayer.mesh.position;
    const rotation = localPlayer.mesh.rotationQuaternion;
    const data = { id: photonManager.photon.myActor().actorNr, actions: localPlayer.actions, position: position, rotation:rotation};

    //photonManager.photon.myRoom().setCustomProperty("pos-" + photonManager.photon.myActor().actorNr.toString(), position);
    photonManager.sendPlayerPositionUpdate(photonManager.photon.myActor().actorNr, position,rotation);
    photonManager.photon.raiseEvent(Photon.LoadBalancing.Constants.EventCode.UserCustom, data);
  }

  scene.render();
});

photonManager.setOnPlayerPositionUpdate((id, actions, position, rotation) => {
   if(id.toString()==photonManager.photon.myActor().actorNr.toString()) return;
   photonManager.playerPositions.set(id.toString(), position);

   const otherPlayer=players.get(id.toString());

   otherPlayer.mesh.position.x=position._x;
   otherPlayer.mesh.position.y=position._y;
   otherPlayer.mesh.position.z=position._z;
   otherPlayer.mesh.rotationQuaternion.w=rotation._w;
   otherPlayer.mesh.rotationQuaternion.x=rotation._x;
   otherPlayer.mesh.rotationQuaternion.y=-rotation._y;
   otherPlayer.mesh.rotationQuaternion.z=-rotation._z;

   players.get(id.toString()).actions = actions;
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