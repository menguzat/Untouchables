export class Particle {
    createBoostParticles() {
        const particleSystem = new BABYLON.ParticleSystem("particles", 2000, this.scene);
        particleSystem.particleTexture = new BABYLON.Texture("../textures/boost.png", this.scene);
        particleSystem.emitter = this.mesh;
        particleSystem.minEmitBox = new BABYLON.Vector3(-0.5, 0, 2);
        particleSystem.maxEmitBox = new BABYLON.Vector3(0.5, 0, 2);
    
        particleSystem.colorDead = new BABYLON.Color4(0, 0, 0, 0.5);
        particleSystem.minSize = 0.6;
        particleSystem.maxSize = 0.9;
        particleSystem.minLifeTime = 0.01;
        particleSystem.maxLifeTime = 0.09;
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
    createFreezeEffectParticleSystem() {
        const tireEffectParticleSystem = new BABYLON.ParticleSystem('tireEffect', 2000, this.scene);
        tireEffectParticleSystem.particleTexture = new BABYLON.Texture('../textures/boost.png', this.scene);
        tireEffectParticleSystem.emitter = this.mesh;
        tireEffectParticleSystem.minEmitBox = new BABYLON.Vector3(-1, 0, -1);
        tireEffectParticleSystem.maxEmitBox = new BABYLON.Vector3(1, 0, 1);
        tireEffectParticleSystem.color1 = new BABYLON.Color4(0.7, 0.8, 1, 1);
        tireEffectParticleSystem.color2 = new BABYLON.Color4(0.2, 0.5, 1, 1);
        tireEffectParticleSystem.colorDead = new BABYLON.Color4(0, 0, 0.2, 0);
        tireEffectParticleSystem.minSize = 0.1;
        tireEffectParticleSystem.maxSize = 0.5;
        tireEffectParticleSystem.minLifeTime = 0.2;
        tireEffectParticleSystem.maxLifeTime = 0.4;
        tireEffectParticleSystem.emitRate = 500;
        tireEffectParticleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
        tireEffectParticleSystem.gravity = new BABYLON.Vector3(0, -9.81, 0);
        tireEffectParticleSystem.direction1 = new BABYLON.Vector3(-7, 8, 3);
        tireEffectParticleSystem.direction2 = new BABYLON.Vector3(7, 8, -3);
        tireEffectParticleSystem.minAngularSpeed = 0;
        tireEffectParticleSystem.maxAngularSpeed = Math.PI;
        tireEffectParticleSystem.minEmitPower = 1;
        tireEffectParticleSystem.maxEmitPower = 3;
        tireEffectParticleSystem.updateSpeed = 0.005;
    
        return tireEffectParticleSystem;
      }
      createWeightEffectParticleSystem() {
        const weightEffect = new BABYLON.ParticleSystem('tireEffect', 2000, this.scene);
        weightEffect.particleTexture = new BABYLON.Texture('../textures/weight.png', this.scene);
        weightEffect.emitter = this.mesh;
        weightEffect.minEmitBox = new BABYLON.Vector3(-1, 0, -1);
        weightEffect.maxEmitBox = new BABYLON.Vector3(1, 0, 1);
        weightEffect.color1 = new BABYLON.Color4(1, 1, 1, 1);
        weightEffect.color2 = new BABYLON.Color4(1, 1, 1, 1);
        weightEffect.colorDead = new BABYLON.Color4(0, 0, 0.2, 0);
        weightEffect.minSize = 1.8;
        weightEffect.maxSize = 4.2;
        weightEffect.minLifeTime = 0.7;
        weightEffect.maxLifeTime = 1.4;
        weightEffect.emitRate = 17;
        weightEffect.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
        weightEffect.gravity = new BABYLON.Vector3(0, 15, 0);
        weightEffect.direction1 = new BABYLON.Vector3(-13, 12, 7);
        weightEffect.direction2 = new BABYLON.Vector3(13, 12, -7);
        weightEffect.minAngularSpeed = 0;
        weightEffect.maxAngularSpeed = Math.PI;
        weightEffect.minEmitPower = 1;
        weightEffect.maxEmitPower = 3;
        weightEffect.updateSpeed = 0.005;
    
        return weightEffect;
      }
      createWheelTrail() {
        // Create particle system
        const wheelTrail = new BABYLON.ParticleSystem("wheelTrail", 400, this.scene);
      
        // Set particle texture and color
        wheelTrail.particleTexture = new BABYLON.Texture("../textures/smoke2.png", this.scene);
        //dark gray color
        wheelTrail.color1 = new BABYLON.Color4(0.1, 0.1, 0.1, 1);
        wheelTrail.color2 = new BABYLON.Color4(0.1, 0.1, 0.1, 1);
        wheelTrail.colorDead = new BABYLON.Color4(0, 0, 0, 0);
      
        // Set particle system properties
        wheelTrail.minSize = 0.8;
        wheelTrail.maxSize = 1.2;
        wheelTrail.minLifeTime = 1;
        wheelTrail.maxLifeTime = 1.6;
        wheelTrail.emitRate = 100;
        wheelTrail.blendMode = BABYLON.ParticleSystem.BLENDMODE_STANDARD;
        wheelTrail.gravity = new BABYLON.Vector3(0, -4, 0);
      
        // Set particle system emitter to the other back wheel
        const emitter2 = new BABYLON.Mesh("emitter2", this.scene);
        emitter2.parent = this.mesh;
        emitter2.position = new BABYLON.Vector3(-1.5, -1, -2.5);
        //rotate emitter2 180 degrees
        emitter2.rotationQuaternion = new BABYLON.Quaternion();
        
        wheelTrail.emitter = emitter2;
        wheelTrail.minEmitBox = new BABYLON.Vector3(-0.1, 0, 0);
        wheelTrail.maxEmitBox = new BABYLON.Vector3(0.1, 0, 0);
      
        // Start the particle system
        wheelTrail.start();
      
        this.wheelTrail = wheelTrail;
      
        return wheelTrail;
      }
      createWheelSmokeTrail() {
        // Create particle system
        const wheelSmokeTrail = new BABYLON.ParticleSystem("wheelSmokeTrail", 400, this.scene);
      
        // Set particle texture and color
        wheelSmokeTrail.particleTexture = new BABYLON.Texture("../textures/cloud.png", this.scene);
        wheelSmokeTrail.color1 = new BABYLON.Color4(1, 1, 1, 1);
        wheelSmokeTrail.color2 = new BABYLON.Color4(1, 1, 1, 1);
        wheelSmokeTrail.colorDead = new BABYLON.Color4(0, 0, 0, 0);
      
        // Set particle system properties
        wheelSmokeTrail.minSize = 1.8;
        wheelSmokeTrail.maxSize = 4.2;
        wheelSmokeTrail.minLifeTime = 1;
        wheelSmokeTrail.maxLifeTime = 1.6;
        wheelSmokeTrail.emitRate = 20;
        wheelSmokeTrail.blendMode = BABYLON.ParticleSystem.BLENDMODE_STANDARD;
        wheelSmokeTrail.gravity = new BABYLON.Vector3(0, 10, 0);
        wheelSmokeTrail.direction1 = new BABYLON.Vector3(-7, 8, 3);
        wheelSmokeTrail.direction2 = new BABYLON.Vector3(7, 8, -3);
      
        // Set particle system emitter to the other back wheel
        const emitter2 = new BABYLON.Mesh("emitter2", this.scene);
        emitter2.parent = this.mesh;
        emitter2.position = new BABYLON.Vector3(1.5, -1, -2.5);
        //rotate emitter2 180 degrees
        emitter2.rotationQuaternion = new BABYLON.Quaternion();
        
        wheelSmokeTrail.emitter = emitter2;
        wheelSmokeTrail.minEmitBox = new BABYLON.Vector3(-0.1, 0, 0);
        wheelSmokeTrail.maxEmitBox = new BABYLON.Vector3(0.1, 0, 0);
      
        // Start the particle system
        wheelSmokeTrail.start();
      
        this.wheelSmokeTrail = wheelSmokeTrail;
      
        return wheelSmokeTrail;
      }
      createWheelTrail2() {
        // Create particle system
        const wheelTrail2 = new BABYLON.ParticleSystem("wheelTrail2", 400, this.scene);
      
        // Set particle texture and color
        wheelTrail2.particleTexture = new BABYLON.Texture("../textures/smoke2.png", this.scene);
        wheelTrail2.color1 = new BABYLON.Color4(0.1, 0.1, 0.1, 1);
        wheelTrail2.color2 = new BABYLON.Color4(0.1, 0.1, 0.1, 1);
        wheelTrail2.colorDead = new BABYLON.Color4(0, 0, 0, 0);
      
        // Set particle system properties
        wheelTrail2.minSize = 0.8;
        wheelTrail2.maxSize = 1.2;
        wheelTrail2.minLifeTime = 1;
        wheelTrail2.maxLifeTime = 1.6;
        wheelTrail2.emitRate = 100;
        wheelTrail2.blendMode = BABYLON.ParticleSystem.BLENDMODE_STANDARD;
        wheelTrail2.gravity = new BABYLON.Vector3(0, -4, 0);
      
        // Set particle system emitter to the other back wheel
        const emitter2 = new BABYLON.Mesh("emitter2", this.scene);
        emitter2.parent = this.mesh;
        emitter2.position = new BABYLON.Vector3(1.5, -1, -2.5);
        //rotate emitter2 180 degrees
        emitter2.rotationQuaternion = new BABYLON.Quaternion();
        
        wheelTrail2.emitter = emitter2;
        wheelTrail2.minEmitBox = new BABYLON.Vector3(-0.1, 0, 0);
        wheelTrail2.maxEmitBox = new BABYLON.Vector3(0.1, 0, 0);
      
        // Start the particle system
        wheelTrail2.start();
      
        this.wheelTrail2 = wheelTrail2;
      
        return wheelTrail2;
      }
      createDashTrail() {
        // Create particle system
        const dashTrail = new BABYLON.ParticleSystem("dashTrail", 200, this.scene);
      
        // Set particle texture and color
        dashTrail.particleTexture = new BABYLON.Texture("../textures/star.png", this.scene);

        dashTrail.colorDead = new BABYLON.Color4(0, 0, 0, 0);
        
        // Set particle system properties
        dashTrail.minSize = 1;
        dashTrail.maxSize = 3;
        dashTrail.minLifeTime = 1;
        dashTrail.maxLifeTime = 1.6;
        dashTrail.emitRate = 200;
        dashTrail.blendMode = BABYLON.ParticleSystem.BLENDMODE_STANDARD;
        dashTrail.gravity = new BABYLON.Vector3(0, -1.8, 0);

        //add direction1 and 2
        dashTrail.direction1 = new BABYLON.Vector3(-2, 3, 7);
        dashTrail.direction2 = new BABYLON.Vector3(7, 3, -2);
        
        // Set particle system emitter to the other back wheel
        const emitter2 = new BABYLON.Mesh("emitter2", this.scene);
        emitter2.parent = this.mesh;
        emitter2.position = new BABYLON.Vector3(0, -0.4, -2.5);
        //rotate emitter2 180 degrees
        emitter2.rotationQuaternion = new BABYLON.Quaternion();
        
        dashTrail.emitter = emitter2;
        dashTrail.minEmitBox = new BABYLON.Vector3(-0.1, 0, 0);
        dashTrail.maxEmitBox = new BABYLON.Vector3(0.1, 0, 0);
        
        // Start the particle system
        dashTrail.start();
        
        this.dashTrail = dashTrail;
        
        return dashTrail;
      }
}