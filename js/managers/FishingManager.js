export default class FishingManager {

    constructor(scene) {

        this.scene = scene;

    }

    createFishingLine() {

        return this.scene.add.graphics();

    }

}
