export class Joystick {
    createJoystick() {
        if(!this.isLocal) return;
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
}