export default class Boat {

    constructor(scene) {

        this.scene = scene;

    }

    create() {

        // Resting Y is controlled by the scene; gentle bobbing is started there
        this.container = this.scene.add.container(
            240,
            560
        );

        const boat = this.scene.add.image(
            0,
            0,
            "boat"
        );

        boat.setScale(0.28);

        this.container.add(boat);

        return this.container;

    }

}