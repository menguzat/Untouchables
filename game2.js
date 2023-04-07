// Import the classes
import { Player } from './classes/Player.js';
import { PhotonManager } from './classes/PhotonManager.js';

// Create the Babylon.js engine and scene
const canvas = document.getElementById('renderCanvas');
const engine = new BABYLON.Engine(canvas, true);
const scene = new BABYLON.Scene(engine);

await Ammo();

scene.enablePhysics(new BABYLON.Vector3(0, -10, 0), new BABYLON.AmmoJSPlugin());

let localPlayer = null;
// Set up the camera and lighting
// Set the background color
scene.clearColor = new BABYLON.Color3(0.8, 0.8, 0.8);

// Create ground
const ground = BABYLON.MeshBuilder.CreateGround('ground', { width: 100, height: 100 }, scene);
const groundMaterial = new BABYLON.StandardMaterial('groundMaterial', scene);
groundMaterial.diffuseColor = new BABYLON.Color3(0.4, 0.4, 0.4);
ground.material = new BABYLON.GridMaterial("groundMaterial", scene);
ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, friction: 0.5, restitution: 0.7 }, scene)


const camera = new BABYLON.ArcRotateCamera("camera1", Math.PI / 2, 2.1, -64, new BABYLON.Vector3(0, 0, 0), scene);
camera.setPosition(new BABYLON.Vector3(10, 40, 40));
camera.setTarget(new BABYLON.Vector3(0, 0, 0));
camera.attachControl(canvas, true);


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
    console.log(actor);

    if (actor.toString() !== photonManager.photon.myActor().actorNr.toString()) {
      const cp = photonManager.photon.myRoom().getCustomProperties();
      console.log(cp);
      for (const id in cp) {
        
        if(id=="pos-"+actor.toString()){
             var otherPlayerPosition  = cp[id];
             var otherPlayerRotation = cp["rot-"+actor.toString()];
          break;
            }
      }
      // console.log(position);

       console.log(otherPlayerPosition);

      // console.log(otherPlayerPosition._x + " " + otherPlayerPosition._y + " " + otherPlayerPosition._z);

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

//players.set('local', localPlayer);

// Set up the main game loop
engine.runRenderLoop(() => {
  if (localPlayer != null) {

    const position = localPlayer.mesh.position;
    const rotation = localPlayer.mesh.rotationQuaternion;
    
    
    const data = { id: photonManager.photon.myActor().actorNr, actions: localPlayer.actions, position: position, rotation:rotation};
    debug(position);
    
    //photonManager.photon.myRoom().setCustomProperty("pos-" + photonManager.photon.myActor().actorNr.toString(), position);
    photonManager.sendPlayerPositionUpdate(photonManager.photon.myActor().actorNr, position,rotation);
    photonManager.photon.raiseEvent(Photon.LoadBalancing.Constants.EventCode.UserCustom, data);
  }

  scene.render();
});

// Handle window resizing
window.addEventListener('resize', () => {
  engine.resize();
});

photonManager.setOnPlayerPositionUpdate((id, actions, position, rotation) => {
   if(id.toString()==photonManager.photon.myActor().actorNr.toString()) return;
   photonManager.playerPositions.set(id.toString(), position);
  
  // if (!players.has(id.toString())) {
  //   const newPlayer = new Player(scene, id, false, position);
  //   players.set(id.toString(), newPlayer);
  //   console.log("other player " + id + "created");

  // } else {
  //   //console.log(position);
      const otherPlayer=players.get(id.toString());
  //   // if (otherPlayer.positionUpdated!=true)
  //   // {
        console.log( position);
   otherPlayer.mesh.position.x=position._x;
   otherPlayer.mesh.position.y=position._y;
   otherPlayer.mesh.position.z=position._z;
   otherPlayer.mesh.rotationQuaternion.w=rotation._w;
   otherPlayer.mesh.rotationQuaternion.x=rotation._x;
   otherPlayer.mesh.rotationQuaternion.y=-rotation._y;
   otherPlayer.mesh.rotationQuaternion.z=-rotation._z;
  //   console.log(otherPlayer.mesh.position-); 
  //   // otherPlayer.positionUpdated = -true;
  //    //  console.log(id.toString()+" "+otherPlayer.mesh.position._x );
  //   // } 

    //  console.log(customProperties[id.toString()]);
    players.get(id.toString()).actions = actions;
  // }
});

var keysActions = {
  "KeyW": 'acceleration',
  "KeyS": 'braking',
  "KeyA": 'left',
  "KeyD": 'right'
};

function keyup(e) {
  if (keysActions[e.code]) {
    localPlayer.actions[keysActions[e.code]] = false;
    //e.preventDefault();
    //e.stopPropagation();

    //return false;
  }
}

function keydown(e) {
  if (keysActions[e.code]) {
    localPlayer.actions[keysActions[e.code]] = true;
    //e.preventDefault();
    //e.stopPropagation();

    //return false;
  }
}
function debug(t) {
  document.getElementById("debug").innerHTML = t+"<br>";
}
