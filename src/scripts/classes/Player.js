export class Player {
  constructor(scene, id, isLocal, position = new BABYLON.Vector3(0, 0, 0), rotation=new BABYLON.Quaternion()) {
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
    this.positionUpdated=false;
    this.previousState=null;
    this.respawnPosition = position.clone();
    this.advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    this.specialActive = false;
    this.special2Active = false;
    this.engineForceMultiplier = 1;
    this.lastSpecialTime = 0;
    this.lastSpecial2Time = 0;
    this.lastSpecial3Time = 0;
    this.wheelMeshes = [];
    this.init();
  }
  updatePhysicsBody(position, rotation) {
    if (this.body) {
      const ammoPosition = new Ammo.btVector3(position._x, position._y, position._z);
      const ammoRotation = new Ammo.btQuaternion(rotation._x, rotation._y, rotation._z, rotation._w);
      const ammoTransform = new Ammo.btTransform();
      ammoTransform.setIdentity();
      ammoTransform.setOrigin(ammoPosition);
      ammoTransform.setRotation(ammoRotation);
      this.body.setWorldTransform(ammoTransform);
      this.body.setMotionState(new Ammo.btDefaultMotionState(ammoTransform));

    //   this.mesh.position.copyFrom(position);
    // this.mesh.rotationQuaternion.copyFrom(rotation);
    } else {
      console.warn(`Attempted to update physics body for player ${this.id} but body is not initialized`);
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
  init() {
    this.mesh = this.createVehicle(this.position, this.rotation);
    this.mesh.position = this.position;
    this.mesh.rotationQuaternion = this.rotation;
    this.positionUpdated = false;
    this.boostParticles = this.createBoostParticles();
    console.log("player " + this.id + " created");
    if (this.isLocal) {
      if (/Mobi|Android/i.test(navigator.userAgent)) {
        // Mobile device detected
        this.createJoystick();
        this.createButtons();
        this.setupControls();
      }
      this.createButtons();
      this.createJoystick();
      this.setupControls();
    }
    else {
     // this.mesh.physicsImpostor.setMass(400);

    }
    var box = new BABYLON.MeshBuilder.CreateBox("box", {width:1, depth:1, height:1}, this.scene);
    box.position.set(1,1,1);
    box.rotation.set(1,1,1);

        box.position.y += 5;

    box.physicsImpostor = new BABYLON.PhysicsImpostor(box, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 1, friction: 0.5, restitution: 0.7 }, this.scene);
    this.mesh.setOr
    return this.mesh;
  }
  
  createJoystick() {
    const joystickContainer = document.createElement("div");
    joystickContainer.style.position = "absolute";
    joystickContainer.style.bottom = "0px";
    joystickContainer.style.left = "0px";
    joystickContainer.style.width = "50%";
    joystickContainer.style.height = "70%";
    //user select none.
    joystickContainer.style.webkitUserSelect = "none";
    joystickContainer.style.mozUserSelect = "none";
    joystickContainer.style.msUserSelect = "none";
    joystickContainer.style.userSelect = "none";
    document.body.appendChild(joystickContainer);
  
    this.joystick = nipplejs.create({
      zone: joystickContainer,
      mode: 'dynamic',
      position: { left: '75%', top: '50%' },
      size: 100,
      color: 'white',
    });
  
    this.joystick.on('move', (event, data) => {
      const angle = data.angle.degree;
  
      this.actions.acceleration = false;
      this.actions.braking = false;
      this.actions.right = false;
      this.actions.left = false;
  
      if (angle >= 10 && angle < 70) {
        this.actions.acceleration |= true;
        this.actions.right |= true;
      } else if (angle >= 110 && angle < 170) {
        this.actions.acceleration |= true;
        this.actions.left |= true;
      } else if (angle >= 70 && angle < 110) {
        this.actions.acceleration |= true;
      }
  
      if (angle >= 235 && angle < 255) {
        this.actions.braking |= true;
        this.actions.left |= true;
      } else if (angle >= 285 && angle < 310) {
        this.actions.braking |= true;
        this.actions.right |= true;
      } else if (angle >= 255 && angle < 285) {
        this.actions.braking |= true;
      }
  
      if (angle >= 0 && angle < 10 || angle >= 310 && angle < 360) {
        this.actions.right |= true;
      }
  
      if (angle >= 170 && angle < 235) {
        this.actions.left |= true;
      }
    });
    
    this.joystick.on('end', () => {
      this.actions.acceleration = false;
      this.actions.braking = false;
      this.actions.right = false;
      this.actions.left = false;
      this.actions.up = false;
      this.actions.down = false;
    });
  }
  

  createButtons() {
    // Create braking button
    const brakingButton = BABYLON.GUI.Button.CreateSimpleButton("brakingButton", "Brake");
    brakingButton.width = "250px";
    brakingButton.height = "125px";
    brakingButton.color = "white";
    brakingButton.background = "black";
    brakingButton.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    brakingButton.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    brakingButton.paddingRight = "10px";
    brakingButton.paddingBottom = "10px";
    brakingButton.top = "-50px";
    brakingButton.textBlock.fontSize = 40;
    this.advancedTexture.addControl(brakingButton);

    brakingButton.onPointerDownObservable.add(() => {
      this.actions.drift = true;
    });

    brakingButton.onPointerUpObservable.add(() => {
      this.actions.drift = false;
    });

    // Create boost button
    const boostButton = BABYLON.GUI.Button.CreateSimpleButton("boostButton", "Boost");
    boostButton.width = "250px";
    boostButton.height = "125px";
    boostButton.color = "white";
    boostButton.background = "black";
    boostButton.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    boostButton.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    boostButton.paddingRight = "10px";
    boostButton.paddingBottom = "10px";
    boostButton.top = "-190px"; // Set the initial position of the boost button
    boostButton.textBlock.fontSize = 40;
    this.advancedTexture.addControl(boostButton);

    boostButton.onPointerDownObservable.add(() => {
      this.actions.boost = true;
    });

    boostButton.onPointerUpObservable.add(() => {
      this.actions.boost = false;
    });

    const specialButton = BABYLON.GUI.Button.CreateSimpleButton("specialButton", "Special");
    specialButton.width = "250px";
    specialButton.height = "125px";
    specialButton.color = "white";
    specialButton.background = "black";
    specialButton.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    specialButton.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    specialButton.paddingRight = "10px";
    specialButton.paddingBottom = "10px";
    specialButton.top = "-330px"; // Set the initial position of the boost button
    specialButton.textBlock.fontSize = 40;
    this.advancedTexture.addControl(specialButton);

    specialButton.onPointerDownObservable.add(() => {
      const currentTime = Date.now();
      if (currentTime - this.lastSpecialTime >= 5000) {
        this.actions.special = true;
        this.lastSpecialTime = currentTime;
    
        // Reset the height of the specialFill rectangle
        specialFill.height = "125px";
        this.advancedTexture.addControl(specialFill);
      }
    });

    specialButton.onPointerUpObservable.add(() => {
      this.actions.special = false;
    });

    const special2Button = BABYLON.GUI.Button.CreateSimpleButton("special2Button", "Special2");
    special2Button.width = "250px";
    special2Button.height = "125px";
    special2Button.color = "white";
    special2Button.background = "black";
    special2Button.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    special2Button.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    special2Button.paddingRight = "10px";
    special2Button.paddingBottom = "10px";
    special2Button.top = "-470px"; // Set the initial position of the boost button
    special2Button.textBlock.fontSize = 40;
    this.advancedTexture.addControl(special2Button);

    special2Button.onPointerDownObservable.add(() => {
      const currentTime = Date.now();
      if (currentTime - this.lastSpecial2Time >= 5000) {
        this.actions.special2 = true;
        this.lastSpecial2Time = currentTime;
    
        // Reset the height of the special2Fill rectangle
        special2Fill.height = "125px";
        this.advancedTexture.addControl(special2Fill);
      }
    });

    special2Button.onPointerUpObservable.add(() => {
      this.actions.special2 = false;
    });

    const special3Button = BABYLON.GUI.Button.CreateSimpleButton("special3Button", "Special3");
    special3Button.width = "250px";
    special3Button.height = "125px";
    special3Button.color = "white";
    special3Button.background = "black";
    special3Button.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    special3Button.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    special3Button.paddingRight = "10px";
    special3Button.paddingBottom = "10px";
    special3Button.top = "-610px"; // Set the initial position of the boost button
    special3Button.textBlock.fontSize = 40;
    this.advancedTexture.addControl(special3Button);

    special3Button.onPointerDownObservable.add(() => {
      const currentTime = Date.now();
      if (currentTime - this.lastSpecial3Time >= 5000) {
        this.actions.special3 = true;
        this.lastSpecial3Time = currentTime;
    
        // Reset the height of the special3Fill rectangle
        special3Fill.height = "125px";
        this.advancedTexture.addControl(special3Fill);
      }
    });

    special3Button.onPointerUpObservable.add(() => {
      this.actions.special3 = false;
    });

    // Special Button filling effect
    const specialFill = new BABYLON.GUI.Rectangle();
    specialFill.width = "250px";
    specialFill.height = "0px";
    specialFill.color = "white";
    specialFill.background = "green";
    specialFill.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    specialFill.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    specialFill.paddingRight = "10px";
    specialFill.paddingBottom = "10px";
    specialFill.top = "-330px"; // Set the initial position of the special fill
    this.advancedTexture.addControl(specialFill);

    // Special2 Button filling effect
    const special2Fill = new BABYLON.GUI.Rectangle();
    special2Fill.width = "250px";
    special2Fill.height = "0px";
    special2Fill.color = "white";
    special2Fill.background = "green";
    special2Fill.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    special2Fill.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    special2Fill.paddingRight = "10px";
    special2Fill.paddingBottom = "10px";
    special2Fill.top = "-470px"; // Set the initial position of the special2 fill
    this.advancedTexture.addControl(special2Fill);

    // Special3 Button filling effect
    const special3Fill = new BABYLON.GUI.Rectangle();
    special3Fill.width = "250px";
    special3Fill.height = "0px";
    special3Fill.color = "white";
    special3Fill.background = "green";
    special3Fill.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    special3Fill.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    special3Fill.paddingRight = "10px";
    special3Fill.paddingBottom = "10px";
    special3Fill.top = "-610px"; // Set the initial position of the special3 fill
    this.advancedTexture.addControl(special3Fill);

    // Update the height of the filling rectangles and button states
    const updateFillingHeight = () => {
      const currentTime = Date.now();

      const specialElapsedTime = (currentTime - this.lastSpecialTime) / 5000;
      const specialHeight = Math.max(0, 125 - specialElapsedTime * 125);
      specialFill.height = specialHeight + "px";
      specialButton.background = specialElapsedTime >= 1 ? "black" : "gray";
      specialButton.isHitTestVisible = specialElapsedTime >= 1;

      const special2ElapsedTime = (currentTime - this.lastSpecial2Time) / 5000;
      const special2Height = Math.max(0, 125 - special2ElapsedTime * 125);
      special2Fill.height = special2Height + "px";
      special2Button.background = special2ElapsedTime >= 1 ? "black" : "gray";
      special2Button.isHitTestVisible = special2ElapsedTime >= 1;

      const special3ElapsedTime = (currentTime - this.lastSpecial3Time) / 5000;
      const special3Height = Math.max(0, 125 - special3ElapsedTime * 125);
      special3Fill.height = special3Height + "px";
      special3Button.background = special3ElapsedTime >= 1 ? "black" : "gray";
      special3Button.isHitTestVisible = special3ElapsedTime >= 1;

      // Schedule the next update
      setTimeout(updateFillingHeight, 50);
    };

    // Start the update loop
    updateFillingHeight();
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

  createBoostParticles() {
    const particleSystem = new BABYLON.ParticleSystem("particles", 2000, this.scene);
    particleSystem.particleTexture = new BABYLON.Texture("../textures/boost.png", this.scene);
    particleSystem.emitter = this.mesh;
    particleSystem.minEmitBox = new BABYLON.Vector3(-0.5, 0, 2);
    particleSystem.maxEmitBox = new BABYLON.Vector3(0.5, 0, 2);

    particleSystem.colorDead = new BABYLON.Color4(0, 0, 0, 0.5);
    particleSystem.minSize = 0.1;
    particleSystem.maxSize = 0.3;
    particleSystem.minLifeTime = 0.1;
    particleSystem.maxLifeTime = 0.11;
    particleSystem.emitRate = 2000;
    particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
    particleSystem.gravity = new BABYLON.Vector3(0, -9.81, 0);
    particleSystem.direction1 = new BABYLON.Vector3(0, 0, 2);
    particleSystem.direction2 = new BABYLON.Vector3(0, 0, 2);
    particleSystem.minEmitPower = 1;
    particleSystem.maxEmitPower = 3;
    particleSystem.updateSpeed = 0.005;
  
    return particleSystem;
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
      wheelInfo.set_m_maxSuspensionForce(600000);
      wheelInfo.set_m_frictionSlip(20);
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

    function createChassisMesh(w, l, h) {
      var mesh = new BABYLON.MeshBuilder.CreateBox("box", { width: w, depth: h, height: l });
      mesh.rotationQuaternion = new BABYLON.Quaternion();
      return mesh;
    }

    var vehicle, chassisMesh;
    

    var vehicleReady = false;

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

    var wheelDirectionCS0;
    var wheelAxleCS;

    var physicsWorld = this.scene.getPhysicsEngine().getPhysicsPlugin().world;

    var wheelDirectionCS0 = new Ammo.btVector3(0, -1, 0);
    var wheelAxleCS = new Ammo.btVector3(-1, 0, 0);

    var geometry = new Ammo.btBoxShape(new Ammo.btVector3(chassisWidth * 1, chassisHeight * 1, chassisLength * 0.75));
    var transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(this.position.x, this.position.y, this.position.x));
    transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
    var motionState = new Ammo.btDefaultMotionState(transform);
    var localInertia = new Ammo.btVector3(0, 0, 0);
    geometry.calculateLocalInertia(massVehicle, localInertia);

    chassisMesh = createChassisMesh(chassisWidth * 1.5, chassisHeight * 1.5, chassisLength * 1.5);

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
        } else {
          driftFriction = 40;
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

        if(this.actions.special && !this.specialActive) {
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
        
          // Set a timer to release the brakes and restore the car's control after 2 seconds
          setTimeout(() => {
            vehicle.setBrake(0, FRONT_LEFT);
            vehicle.setBrake(0, FRONT_RIGHT);
            vehicle.setBrake(0, BACK_LEFT);
            vehicle.setBrake(0, BACK_RIGHT);
        
            // Mark special as inactive
            this.specialActive = false;
            this.engineForceMultiplier = 1;
          }, 2000);
        }        

        if(this.actions.special2 && !this.special2Active) {
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
      
          // Set a timer to mark special3 as inactive after a short delay
          setTimeout(() => {
            this.special3Active = false;
            const stopImpulse = new Ammo.btVector3(0, 0, 0);
            this.body.setLinearVelocity(stopImpulse);
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
      if (chassisMesh.position.y < -5) {
        this.respawn();
      }
    });

    
    return chassisMesh  ;
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