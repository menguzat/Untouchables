import { Gamebuttons } from './ButtonsNDJoystick/Buttons.js';
import { Joystick } from './ButtonsNDJoystick/Joystick.js';
import { Particle } from './Particles/particles.js'

export class Player {
  constructor(scene, id, isLocal, position = new BABYLON.Vector3(0, 0, 0), rotation = new BABYLON.Quaternion()) {
    console.log(position);
    this.scene = scene;
    this.engine = scene.getEngine();
    this.id = id;
    this.isLocal = isLocal;
    this.position = position;
    this.rotation = rotation;
    this.speed = 0.05;
    this.ZERO_QUATERNION = new BABYLON.Quaternion();
    this.actions = { acceleration: false, braking: false, right: false, left: false, drift: false, boost: false, special: false, special2: false, special3: false };
    this.mesh = null;
    this.positionUpdated = false;
    this.previousState = null;
    this.respawnPosition = position.clone();
    this.advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    this.specialActive = false;
    this.special2Active = false;
    this.engineForceMultiplier = 1;
    this.lastSpecialTime = 0;
    this.lastSpecial2Time = 0;
    this.lastSpecial3Time = 0;
    this.wheelMeshes = [];
    this.gamebuttons = new Gamebuttons();
    this.joystick = new Joystick();
    this.particles = new Particle();
    this.wheelTrail = null;
    this.init();
  }
  updateActions(actions) {
    this.actions = actions;
  }
  updatePhysicsBody(position, rotation, linearVelocity, angularVelocity, applyImpulse = false) {
    if (this.body && !this.isLocal) {
      const ammoPosition = new Ammo.btVector3(position.x, position.y, position.z);
      const ammoRotation = new Ammo.btQuaternion(rotation.x, rotation.y, rotation.z, rotation.w);
      const ammoTransform = new Ammo.btTransform();
      ammoTransform.setIdentity();
      ammoTransform.setOrigin(ammoPosition);
      ammoTransform.setRotation(ammoRotation);
      this.body.setWorldTransform(ammoTransform);
      this.body.setMotionState(new Ammo.btDefaultMotionState(ammoTransform));
      this.body.setLinearVelocity(linearVelocity);
      this.body.setAngularVelocity(angularVelocity);
      this.body.activate();
      this.body.setCollisionFlags(2); // Set the CF_NO_CONTACT_RESPONSE flag to disable push response

      if (applyImpulse) {
        const impulse = linearVelocity.clone().multiplyScalar(this.body.getMass() * 2); // Adjust the multiplier as needed
        const ammoImpulse = new Ammo.btVector3(impulse.x, impulse.y, impulse.z);
        this.body.applyCentralImpulse(ammoImpulse);
      }

    } else {
      console.warn(`Attempted to update physics body for player ${this.id} but body is not initialized`);
    }
  }
  correctState(authoritativeState) {
    this.state = authoritativeState;
  }
  handleCollision(otherPlayerId) {
    const otherPlayer = this.players.get(otherPlayerId);
    if (otherPlayer) {
      // Calculate the new position and velocity after the collision
      const newPosition = this.position.add(this.velocity);
      const newVelocity = this.velocity.subtract(otherPlayer.velocity);
      // Update the player's state
      this.state.position = newPosition;
      this.state.velocity = newVelocity;
    }
  }
  predictCollision(otherPlayerId) {
    const otherPlayer = this.players.get(otherPlayerId);
    if (otherPlayer) {
      // Predict the new position and velocity after the collision
      const predictedPosition = this.position.add(this.velocity);
      const predictedVelocity = this.velocity.subtract(otherPlayer.velocity);
      // Update the player's state
      this.state.position = predictedPosition;
      this.state.velocity = predictedVelocity;
    }
  }
  updatePhysicsBodyRotation(rotation) {
    if (this.body) {
      const ammoRotation = new Ammo.btQuaternion(rotation.x, rotation.y, rotation.z, rotation.w);
      const ammoTransform = this.body.getCenterOfMassTransform();
      ammoTransform.setRotation(ammoRotation);
      this.body.setCenterOfMassTransform(ammoTransform);
    } else {
      console.warn(`Attempted to update physics body rotation for player ${this.id} but body is not initialized`);
    }
  }

  getState() {
    return {
      id: this.id,
      position: this.position.clone(),
      rotation: this.rotation.clone(),
      actions: { ...this.actions },
      speed: this.speed,
      specialActive: this.specialActive,
      special2Active: this.special2Active,
      engineForceMultiplier: this.engineForceMultiplier,
      lastSpecialTime: this.lastSpecialTime,
      lastSpecial2Time: this.lastSpecial2Time,
      lastSpecial3Time: this.lastSpecial3Time,
    };
  }

  init() {
    this.mesh = this.createVehicle(this.position, this.rotation);
    this.mesh.position = this.position;
    this.mesh.rotationQuaternion = this.rotation;
    this.positionUpdated = false;
    this.boostParticles = this.particles.createBoostParticles.call(this);

    this.freezeEffect = this.particles.createFreezeEffectParticleSystem.call(this);
    this.freezeEffect.stop();

    this.wheelTrail = this.particles.createWheelTrail.call(this);
    this.wheelTrail.stop();

    this.wheelTrail2 = this.particles.createWheelTrail2.call(this);
    this.wheelTrail2.stop();

    this.dashTrail = this.particles.createDashTrail.call(this);
    this.dashTrail.stop();

    this.wheelSmokeTrail = this.particles.createWheelSmokeTrail.call(this);
    this.wheelSmokeTrail.stop();

    this.weightEffect = this.particles.createWeightEffectParticleSystem.call(this);
    this.weightEffect.stop();

    console.log("player " + this.id + " created");
    if (this.isLocal) {
      if (/Mobi|Android/i.test(navigator.userAgent)) {
        // Mobile device detected
        this.joystick.createJoystick.call(this);
        this.gamebuttons.createButtons.call(this);
        this.setupControls();
      }
      this.joystick.createJoystick.call(this);
      this.gamebuttons.createButtons.call(this);
      this.setupControls();
    }
    else {
      // this.mesh.physicsImpostor.setMass(400);
    }
    var box = new BABYLON.MeshBuilder.CreateBox("box", { width: 1, depth: 1, height: 1 }, this.scene);
    box.position.set(1, 1, 1);
    box.rotation.set(1, 1, 1);
    box.position.y += 5;
    box.physicsImpostor = new BABYLON.PhysicsImpostor(box, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 1, friction: 0.5, restitution: 0.7 }, this.scene);

    return this.mesh;
  }

  respawn() {
    var transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(0, 0, 0));
    transform.setRotation(new Ammo.btQuaternion(0, 0, 0, 1));
    this.body.setCenterOfMassTransform(transform);
    this.body.setLinearVelocity(new Ammo.btVector3(0, 0, 0));
    this.body.setAngularVelocity(new Ammo.btVector3(0, 0, 0));
    this.body.activate();
  }

  createVehicle(pos, quat) {
    const addWheel = (isFront, pos, radius, width, index) => {
      var wheelInfo = vehicle.addWheel(
        pos,
        wheelDirectionCS0,
        wheelAxleCS,
        suspensionRestLength,
        radius,
        tuning,
        isFront);
      if (!isFront) {
        wheelInfo.set_m_frictionSlip(driftFriction);
      }
      wheelInfo.set_m_suspensionStiffness(suspensionStiffness);
      wheelInfo.set_m_wheelsDampingRelaxation(suspensionDamping);
      wheelInfo.set_m_wheelsDampingCompression(suspensionCompression);
      wheelInfo.set_m_maxSuspensionForce(200000);
      wheelInfo.set_m_frictionSlip(10);
      wheelInfo.set_m_rollInfluence(rollInfluence);


      var wheelMaterial = new BABYLON.StandardMaterial("wheelMaterial");
      wheelMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.2);

      this.wheelMeshes[index] = createWheelMesh(radius, width);
      if (isFront) {
        var wheelMaterial = new BABYLON.StandardMaterial("wheelMaterial");
        wheelMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.2);
        this.wheelMeshes[index].material = wheelMaterial;
      }
    }

    function createWheelMesh(radius, width) {
      //var mesh = new BABYLON.MeshBuilder.CreateBox("wheel", {width:.82, height:.82, depth:.82});
      var mesh = new BABYLON.MeshBuilder.CreateCylinder("Wheel", { diameter: 1.5, height: 0.8, tessellation: 12 });
      mesh.rotationQuaternion = new BABYLON.Quaternion();
      return mesh;
    }

    function createChassisMesh(w, l, h, color) {
      var mesh = new BABYLON.MeshBuilder.CreateBox("box", { width: w, depth: h, height: l });
      mesh.rotationQuaternion = new BABYLON.Quaternion();

      var chassisMaterial = new BABYLON.StandardMaterial("chassisMaterial");
      chassisMaterial.diffuseColor = color;
      mesh.material = chassisMaterial;

      return mesh;
    }

    var vehicle, chassisMesh, wheelDirectionCS0, wheelAxleCS, vehicleReady = false;

    var chassisWidth = 1.8;
    var chassisHeight = .6;
    var chassisLength = 4;
    var massVehicle = 400;//200

    var wheelAxisPositionBack = -2;
    var wheelRadiusBack = .8;
    var wheelWidthBack = .6;
    var wheelHalfTrackBack = 1.5;
    var wheelAxisHeightBack = 0.4;

    var wheelAxisFrontPosition = 2.0;
    var wheelHalfTrackFront = 1.5;
    var wheelAxisHeightFront = 0.4;
    var wheelRadiusFront = .8;
    var wheelWidthFront = .6;

    var friction = 5;
    var suspensionStiffness = 20;
    var suspensionDamping = 1;
    var suspensionCompression = 2;
    var suspensionRestLength = 0.6;
    var rollInfluence = -0.2;

    var steeringIncrement = .01;
    var steeringClamp = 0.4;
    var maxEngineForce = 3000;
    var maxBreakingForce = 20;
    var incEngine = 10.0;
    var driftBreakingForce = 7;

    var FRONT_LEFT = 0;
    var FRONT_RIGHT = 1;
    var BACK_LEFT = 2;
    var BACK_RIGHT = 3;

    var driftFriction = 40;

    var physicsWorld = this.scene.getPhysicsEngine().getPhysicsPlugin().world;

    var wheelDirectionCS0 = new Ammo.btVector3(0, -1, 0);
    var wheelAxleCS = new Ammo.btVector3(-1, 0, 0);

    var localPlayerColor = new BABYLON.Color3(1, 1, 0); // Yellow
    var otherPlayerColor = new BABYLON.Color3(1, 0, 0); // Red

    var geometry = new Ammo.btBoxShape(new Ammo.btVector3(chassisWidth * 1, chassisHeight * 1, chassisLength * 0.75));
    var transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(this.position.x, this.position.y, this.position.x));
    transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
    var motionState = new Ammo.btDefaultMotionState(transform);
    var localInertia = new Ammo.btVector3(0, 0, 0);
    geometry.calculateLocalInertia(massVehicle, localInertia);

    chassisMesh = createChassisMesh(chassisWidth * 1.5, chassisHeight * 1.5, chassisLength * 1.5, this.isLocal ? localPlayerColor : otherPlayerColor);

    var massOffset = new Ammo.btVector3(0, 0.4, 0);
    var transform2 = new Ammo.btTransform();
    transform2.setIdentity();
    transform2.setOrigin(massOffset);
    var compound = new Ammo.btCompoundShape();
    compound.addChildShape(transform2, geometry);
    compound.position = this.position;
    var body = new Ammo.btRigidBody(new Ammo.btRigidBodyConstructionInfo(massVehicle, motionState, compound, localInertia));
    body.setActivationState(4);

    this.body = body;

    physicsWorld.addRigidBody(body);

    var engineForce = 0;
    var vehicleSteering = 0;
    var breakingForce = 0;
    var tuning = new Ammo.btVehicleTuning();
    var rayCaster = new Ammo.btDefaultVehicleRaycaster(physicsWorld);
    vehicle = new Ammo.btRaycastVehicle(tuning, body, rayCaster);
    vehicle.setCoordinateSystem(0, 1, 2);
    physicsWorld.addAction(vehicle);

    var trans = vehicle.getChassisWorldTransform();
    trans.setOrigin(new Ammo.btVector3(this.position.x, this.position.y, this.position.z));
    //vehicle.setChassisWorldTransform(trans);

    addWheel(true, new Ammo.btVector3(wheelHalfTrackFront, wheelAxisHeightFront, wheelAxisFrontPosition), wheelRadiusFront, wheelWidthFront, FRONT_LEFT);
    addWheel(true, new Ammo.btVector3(-wheelHalfTrackFront, wheelAxisHeightFront, wheelAxisFrontPosition), wheelRadiusFront, wheelWidthFront, FRONT_RIGHT);
    addWheel(false, new Ammo.btVector3(-wheelHalfTrackBack, wheelAxisHeightBack, wheelAxisPositionBack), wheelRadiusBack, wheelWidthBack, BACK_LEFT);
    addWheel(false, new Ammo.btVector3(wheelHalfTrackBack, wheelAxisHeightBack, wheelAxisPositionBack), wheelRadiusBack, wheelWidthBack, BACK_RIGHT);

    vehicleReady = true;

    this.scene.registerBeforeRender(() => {
      // var dt = this.engine.getDeltaTime().toFixed() / 1000;,

      if (vehicleReady) {
        var speed = vehicle.getCurrentSpeedKmHour();
        var maxSteerVal = 0.2;
        breakingForce = 0;
        engineForce = 0;

        if (this.actions.acceleration) {
          if (speed < -1) {
            breakingForce = maxBreakingForce;
          } else {
            engineForce = maxEngineForce;
          }
        } else if (this.actions.braking) {
          if (speed > 1) {
            breakingForce = maxBreakingForce;
          } else {
            engineForce = -maxEngineForce;
          }
        }
        if (this.actions.right) {
          if (vehicleSteering < steeringClamp) {
            vehicleSteering += steeringIncrement;
          }
        } else if (this.actions.left) {
          if (vehicleSteering > -steeringClamp) {
            vehicleSteering -= steeringIncrement;
          }
        } else {
          vehicleSteering = 0;
        }
        if (this.actions.drift) {
          driftFriction = 5;
          breakingForce += driftBreakingForce * 6;
          this.wheelTrail.start();
          this.wheelTrail2.start();
          this.wheelSmokeTrail.start();
        } else {
          driftFriction = 40;
          this.wheelTrail.stop();
          this.wheelTrail2.stop();
          this.wheelSmokeTrail.stop();
        }
        if (this.actions.boost) {
          engineForce = maxEngineForce * 1.6;
          if (!this.boostParticles.isStarted()) {
            this.boostParticles.start();
          }
        } else {
          if (this.boostParticles.isStarted()) {
            this.boostParticles.stop();
          }
        }

        if (this.actions.special && !this.specialActive) {
          // Mark special as active
          this.specialActive = true;
          this.engineForceMultiplier = 0;

          // Apply a large braking force to all wheels
          vehicle.setBrake(10000, FRONT_LEFT);
          vehicle.setBrake(10000, FRONT_RIGHT);
          vehicle.setBrake(10000, BACK_LEFT);
          vehicle.setBrake(10000, BACK_RIGHT);

          // Set the car's linear and angular velocity to zero
          const linearVelocity = this.body.getLinearVelocity();
          linearVelocity.setValue(0, 0, 0);
          this.body.setLinearVelocity(linearVelocity);

          const angularVelocity = this.body.getAngularVelocity();
          angularVelocity.setValue(0, 0, 0);
          this.body.setAngularVelocity(angularVelocity);

          if (!this.freezeEffect.isStarted()) {
            this.freezeEffect.start();
          }

          // Set a timer to release the brakes and restore the car's control after 2 seconds
          setTimeout(() => {
            vehicle.setBrake(0, FRONT_LEFT);
            vehicle.setBrake(0, FRONT_RIGHT);
            vehicle.setBrake(0, BACK_LEFT);
            vehicle.setBrake(0, BACK_RIGHT);

            if (this.freezeEffect.isStarted()) {
              this.freezeEffect.stop();
            }

            // Mark special as inactive
            this.specialActive = false;
            this.engineForceMultiplier = 1;
          }, 2000);
        }

        if (this.actions.special2 && !this.special2Active) {
          // Mark special2 as active
          this.special2Active = true;

          // Increase the car's mass by a factor of 10
          const massFactor = 10;
          const originalMass = massVehicle;
          const increasedMass = originalMass * massFactor;
          this.body.setMassProps(increasedMass, localInertia);

          // Set the car's linear and angular velocity to zero
          const linearVelocity = this.body.getLinearVelocity();
          linearVelocity.setValue(0, 0, 0);
          this.body.setLinearVelocity(linearVelocity);

          const angularVelocity = this.body.getAngularVelocity();
          angularVelocity.setValue(0, 0, 0);
          this.body.setAngularVelocity(angularVelocity);

          this.weightEffect.start();

          // Set a timer to reset the mass after 2 seconds
          setTimeout(() => {
            // Reset the car's mass to the original value
            this.body.setMassProps(originalMass, localInertia);

            // Release the brakes after a short delay
            setTimeout(() => {
              vehicle.setBrake(0, FRONT_LEFT);
              vehicle.setBrake(0, FRONT_RIGHT);
              vehicle.setBrake(0, BACK_LEFT);
              vehicle.setBrake(0, BACK_RIGHT);
              this.weightEffect.stop();
              // Mark special2 as inactive
              this.special2Active = false;
            }, 200);
          }, 2000);

        }

        if (this.actions.special3 && !this.special3Active) {
          // Mark special3 as active
          this.special3Active = true;

          // Calculate the current speed and movement direction
          const speed = vehicle.getCurrentSpeedKmHour() / 3.6;
          const movementDirection = vehicle.getForwardVector();

          // Calculate the extra force for the quick dash
          const dashForce = 50000;

          // Apply the dash force to the vehicle
          const impulse = new Ammo.btVector3(movementDirection.x() * dashForce, 0, movementDirection.z() * dashForce);
          this.body.applyCentralImpulse(impulse);

          this.dashTrail.start();

          // Set a timer to mark special3 as inactive after a short delay
          setTimeout(() => {
            this.special3Active = false;
            const stopImpulse = new Ammo.btVector3(0, 0, 0);
            this.body.setLinearVelocity(stopImpulse);
            this.dashTrail.stop();
          }, 200);
        }

        vehicle.getWheelInfo(BACK_LEFT).set_m_frictionSlip(driftFriction / 1.1);
        vehicle.getWheelInfo(BACK_RIGHT).set_m_frictionSlip(driftFriction / 1.1);
        vehicle.getWheelInfo(FRONT_LEFT).set_m_frictionSlip(driftFriction);
        vehicle.getWheelInfo(FRONT_RIGHT).set_m_frictionSlip(driftFriction);

        vehicle.applyEngineForce(engineForce * this.engineForceMultiplier, FRONT_LEFT);
        vehicle.applyEngineForce(engineForce * this.engineForceMultiplier, FRONT_RIGHT);

        vehicle.setBrake(breakingForce / 2, FRONT_LEFT);
        vehicle.setBrake(breakingForce / 2, FRONT_RIGHT);
        vehicle.setBrake(breakingForce, BACK_LEFT);
        vehicle.setBrake(breakingForce, BACK_RIGHT);

        vehicle.setSteeringValue(vehicleSteering, FRONT_LEFT);
        vehicle.setSteeringValue(vehicleSteering, FRONT_RIGHT);

        var tm, p, q, i;
        var n = vehicle.getNumWheels();
        for (i = 0; i < n; i++) {
          vehicle.updateWheelTransform(i, true);
          tm = vehicle.getWheelTransformWS(i);
          p = tm.getOrigin();
          q = tm.getRotation();
          this.wheelMeshes[i].position.set(p.x(), p.y(), p.z());
          this.wheelMeshes[i].rotationQuaternion.set(q.x(), q.y(), q.z(), q.w());
          this.wheelMeshes[i].rotate(BABYLON.Axis.Z, Math.PI / 2);
        }

        tm = vehicle.getChassisWorldTransform();
        p = tm.getOrigin();
        q = tm.getRotation();
        chassisMesh.position.set(p.x(), p.y(), p.z());
        chassisMesh.rotationQuaternion.set(q.x(), q.y(), q.z(), q.w());
        //chassisMesh.rotate(BABYLON.Axis.X, Math.PI);
      }
      if (chassisMesh.position.y < -5 || chassisMesh.position.y > 20) {
        this.respawn();
      }
    });

    return chassisMesh;
  }

  setupControls() {

  }

  moveForward() {
    this.mesh.position.z -= this.speed;
  }

  moveBackward() {
    this.mesh.position.z += this.speed;
  }

  moveLeft() {
    this.mesh.position.x -= this.speed;
  }

  moveRight() {
    this.mesh.position.x += this.speed;
  }

  updatePosition(position) {
    this.mesh.position = position;
  }

  destroy() {
    if (this.body) {
      const physicsEngine = this.scene.getPhysicsEngine();
      const physicsWorld = physicsEngine.getPhysicsPlugin().world;
      physicsWorld.removeRigidBody(this.body);
      this.body = null;
    }
    if (this.vehicle) {
      this.scene.getPhysicsEngine().removeAction(this.vehicle);
      this.vehicle = null;
    }
    if (this.mesh) {
      this.wheelMeshes.forEach((wheelMesh) => { wheelMesh.dispose() });
      this.mesh.dispose();
      this.mesh = null;
      console.log(`Player ${this.id} destroyed`);
    } else {
      console.warn(`Attempted to destroy player ${this.id} but mesh is not initialized`);
    }
  }
}