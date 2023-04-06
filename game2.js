// Import the classes
import { Player } from './classes/Player.js';
import { PhotonManager } from './classes/PhotonManager.js';

// Create the Babylon.js engine and scene
const canvas = document.getElementById('renderCanvas');
const engine = new BABYLON.Engine(canvas, true);
const scene = new BABYLON.Scene(engine);

await Ammo();

scene.enablePhysics(new BABYLON.Vector3(0,-10,0), new BABYLON.AmmoJSPlugin());

let localPlayer=null;
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
    localPlayer = new Player(scene, photonManager.photon.myActor().actorNr, true, new BABYLON.Vector3(0, 0, 5));
    players.set(photonManager.photon.myActor().actorNr.toString(), localPlayer);

    const otherActors = photonManager.photon.myRoomActors();
    console.log(otherActors);

    window.addEventListener('keydown', keydown);
    window.addEventListener('keyup', keyup);

    console.log("my actor nr "+photonManager.photon.myActor().actorNr);
  for(var i=1; i<=otherActors.length; i++) {
    console.log(otherActors[i].actorNr);
  }

  for (var actor in otherActors) {
    console.log(actor);
    console.log(actor + " "+photonManager.photon.myActor().actorNr);
    if ( actor.toString() !== photonManager.photon.myActor().actorNr.toString()) {
      console.log("creating other player");
      const otherPlayer = new Player(scene, actor, false,);
      console.log("other player created"+ actor);
      players.set(actor.toString(), otherPlayer);
    }
  }
  });

  photonManager.setOnActorJoin((actor) => {
    console.log("actor joined "+ photonManager.photon.myActor().actorNr+" "+actor.actorNr);
    if(photonManager.photon.myActor().actorNr === actor.actorNr) {
      return;
    }
    const newPlayer = new Player(scene, actor.actorNr, false);
    players.set(actor.actorNr.toString(), newPlayer);
    console.log("new player joined" +actor);
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
    if(localPlayer!=null) {

        const position = localPlayer.mesh.position;

        const data = { id: photonManager.photon.myActor().actorNr, actions: localPlayer.actions, position: localPlayer.position};
        photonManager.photon.raiseEvent(Photon.LoadBalancing.Constants.EventCode.UserCustom, data);
      }
      
  scene.render();
});

// Handle window resizing
window.addEventListener('resize', () => {
  engine.resize();
});

photonManager.setOnPlayerPositionUpdate((id,actions,position) => {

    if (!players.has(id.toString())) {
      const newPlayer = new Player(scene, id, false, position);
      players.set(id, newPlayer);
    } else {
      //console.log(position);
      players.get(id.toString()).setOrigin(new Ammo.btVector3(position.x, position.y, position.z));
      players.get(id.toString()).actions=actions;
    }
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