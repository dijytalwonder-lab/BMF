export default class FishingRod {

    constructor(scene, boatContainer) {

        this.scene = scene;
        this.boatContainer = boatContainer;

    }

    create() {

        this.rod = this.scene.add.image(
            95,
            -18,
            "fishingRod"
        );

        this.rod.setScale(0.16);

        this.rod.setAngle(40);

        this.boatContainer.add(this.rod);

        // Position of the rod tip relative to the boat
        this.rodTip = {

            x: 108,
            y: -62

        };

        this.scene.tweens.add({

            targets: this.rod,

            angle: 32,

            duration: 1200,

            yoyo: true,

            repeat: -1,

            ease: "Sine.easeInOut"

        });

        return this;

    }

    getTipPosition() {

        return {

            x: this.boatContainer.x + this.rodTip.x,

            y: this.boatContainer.y + this.rodTip.y

        };

    }

}