export default class Bobber {

    constructor(scene) {

        this.scene = scene;

    }

    create() {

        this.bobber = this.scene.add.image(
            0,
            0,
            "bobber"
        );

        this.bobber.setScale(0.18);

        this.bobber.setVisible(false);

        return this.bobber;

    }

}
