export class Player {
  constructor(scene, id, isLocal, position = new BABYLON.Vector3(0, 0, 0)) {
    this.scene = scene;
    this.engine = scene.getEngine();
    this.id = id;
    this.isLocal = isLocal;
    this.position = position;
    this.speed = 0.05;
    this.ZERO_QUATERNION = new BABYLON.Quaternion();
    this.actions = { acceleration: false, braking: false, right: false, left: false };
    this.mesh = null;
    this.init();
  }

  init() {
    this.mesh = this.createVehicle(this.position, this.ZERO_QUATERNION);
    this.mesh.position = this.position;
    console.log("player " + this.id + " created");
    if (this.isLocal) {
      this.setupControls();
    }
    this.mesh.setOr
    return this.mesh;
  }

  createVehicle(pos, quat) {

    function addWheel(isFront, pos, radius, width, index) {

      var wheelInfo = vehicle.addWheel(
        pos,
        wheelDirectionCS0,
        wheelAxleCS,
        suspensionRestLength,
        radius,
        tuning,
        isFront);

      wheelInfo.set_m_suspensionStiffness(suspensionStiffness);
      wheelInfo.set_m_wheelsDampingRelaxation(suspensionDamping);
      wheelInfo.set_m_wheelsDampingCompression(suspensionCompression);
      wheelInfo.set_m_maxSuspensionForce(600000);
      wheelInfo.set_m_frictionSlip(40);
      wheelInfo.set_m_rollInfluence(rollInfluence);

      wheelMeshes[index] = createWheelMesh(radius, width);
    }

    function createWheelMesh(radius, width) {
      //var mesh = new BABYLON.MeshBuilder.CreateBox("wheel", {width:.82, height:.82, depth:.82});
      var mesh = new BABYLON.MeshBuilder.CreateCylinder("Wheel", { diameter: 1, height: 0.5, tessellation: 6 });
      mesh.rotationQuaternion = new BABYLON.Quaternion();
      console.log("wheel mesh created");
      return mesh;
    }

    function createChassisMesh(w, l, h) {
      var mesh = new BABYLON.MeshBuilder.CreateBox("box", { width: w, depth: h, height: l });
      mesh.rotationQuaternion = new BABYLON.Quaternion();
      console.log("chassis mesh created");
      return mesh;
    }
    var vehicle, chassisMesh;
    var wheelMeshes = [];

    var vehicleReady = false;

    var chassisWidth = 1.8;
    var chassisHeight = .6;
    var chassisLength = 4;
    var massVehicle = 200;

    var wheelAxisPositionBack = -1;
    var wheelRadiusBack = .4;
    var wheelWidthBack = .3;
    var wheelHalfTrackBack = 1;
    var wheelAxisHeightBack = 0.4;

    var wheelAxisFrontPosition = 1.0;
    var wheelHalfTrackFront = 1;
    var wheelAxisHeightFront = 0.4;
    var wheelRadiusFront = .4;
    var wheelWidthFront = .3;

    var friction = 5;
    var suspensionStiffness = 10;
    var suspensionDamping = 0.3;
    var suspensionCompression = 4.4;
    var suspensionRestLength = 0.6;
    var rollInfluence = 0.0;

    var steeringIncrement = .01;
    var steeringClamp = 0.2;
    var maxEngineForce = 500;
    var maxBreakingForce = 10;
    var incEngine = 10.0;

    var FRONT_LEFT = 0;
    var FRONT_RIGHT = 1;
    var BACK_LEFT = 2;
    var BACK_RIGHT = 3;

    var wheelDirectionCS0;
    var wheelAxleCS;

    var physicsWorld = this.scene.getPhysicsEngine().getPhysicsPlugin().world;

    var wheelDirectionCS0 = new Ammo.btVector3(0, -1, 0);
    var wheelAxleCS = new Ammo.btVector3(-1, 0, 0);

    var geometry = new Ammo.btBoxShape(new Ammo.btVector3(chassisWidth * .5, chassisHeight * .5, chassisLength * .5));
    var transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(this.position.x, this.position.y, this.position.x));
    transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
    var motionState = new Ammo.btDefaultMotionState(transform);
    var localInertia = new Ammo.btVector3(0, 0, 0);
    geometry.calculateLocalInertia(massVehicle, localInertia);

    chassisMesh = createChassisMesh(chassisWidth, chassisHeight, chassisLength);

    var massOffset = new Ammo.btVector3(0, 0.4, 0);
    var transform2 = new Ammo.btTransform();
    transform2.setIdentity();
    transform2.setOrigin(massOffset);
    var compound = new Ammo.btCompoundShape();
    compound.addChildShape(transform2, geometry);
    compound.position = this.position;
    console.log("compound created at " + this.position);
    var body = new Ammo.btRigidBody(new Ammo.btRigidBodyConstructionInfo(massVehicle, motionState, compound, localInertia));
    body.setActivationState(4);

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
      // var dt = this.engine.getDeltaTime().toFixed() / 1000;

      if (vehicleReady) {

        var speed = vehicle.getCurrentSpeedKmHour();
        var maxSteerVal = 0.2;
        breakingForce = 0;
        engineForce = 0;

        //      console.log("acc: " +this.actions.acceleration);
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

        vehicle.applyEngineForce(engineForce, FRONT_LEFT);
        vehicle.applyEngineForce(engineForce, FRONT_RIGHT);

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
          wheelMeshes[i].position.set(p.x(), p.y(), p.z());
          wheelMeshes[i].rotationQuaternion.set(q.x(), q.y(), q.z(), q.w());
          wheelMeshes[i].rotate(BABYLON.Axis.Z, Math.PI / 2);
        }

        tm = vehicle.getChassisWorldTransform();
        p = tm.getOrigin();
        q = tm.getRotation();
        chassisMesh.position.set(p.x(), p.y(), p.z());
        chassisMesh.rotationQuaternion.set(q.x(), q.y(), q.z(), q.w());
        chassisMesh.rotate(BABYLON.Axis.X, Math.PI);
      }

    });

    return trans;
  }


  setupControls() {
    this.scene.actionManager = new BABYLON.ActionManager(this.scene);

    this.scene.actionManager.registerAction(
      new BABYLON.ExecuteCodeAction(
        BABYLON.ActionManager.OnKeyDownTrigger,
        (evt) => {
          switch (evt.sourceEvent.key) {
            case 'w':
              this.moveForward();
              break;
            case 'a':
              this.moveLeft();
              break;
            case 's':
              this.moveBackward();
              break;
            case 'd':
              this.moveRight();
              break;
          }
        }
      )
    );
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
    console.log(position);
    this.position = position;
  }
  destroy() {
    // Perform any necessary cleanup operations here
    if (this.mesh) {
      this.mesh.dispose();
      this.scene.getPhysicsEngine().removeAction(this.vehicle);
      console.log(`Player ${this.id} destroyed`);
    } else {
      console.warn(`Attempted to destroy player ${this.id} but mesh is not initialized`);
    }
  }
}
