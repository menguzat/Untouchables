export class Gamebuttons {
    createButtons() {
    if(!this.isLocal) return;
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
}