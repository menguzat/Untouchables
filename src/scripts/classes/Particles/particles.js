export class Particle {
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
}