import Phaser from "phaser";
import GameData from "../data/GameData.js";
import AudioManager from "../managers/AudioManager.js";
import DECORATIONS from "../data/decorations.js";

export default class HomeDecorationScene extends Phaser.Scene {

    constructor() {
        super("HomeDecorationScene");
    }

    create() {

        this.cameras.main.fadeIn(500, 255, 255, 255);

        // Outdoor scene behind
        const outdoor = this.add.image(240, 400, "homeBackground");
        outdoor.setScale(Math.max(480 / outdoor.width, 800 / outdoor.height));
        outdoor.setDepth(0);

        // House-interior cutout floating on top
        const house = this.add.image(240, 385, "houseInside");
        house.setScale(Math.min(480 / house.width, 800 / house.height));
        house.setDepth(1);

        // Bunny standing on the ground floor
        this.add.image(
            235,
            560,
            "bunny"
        ).setScale(0.16).setDepth(5);

        this.add.text(

            240,
            60,

            "🏡 Bunny's Home",

            {

                fontFamily: "Arial",
                fontSize: "34px",
                color: "#4A3A24",
                fontStyle: "bold",
                stroke: "#FFFFFF",
                strokeThickness: 4

            }

        ).setOrigin(0.5).setDepth(10);

        this.placeDecorations();

        this.createSleepButton();

        AudioManager.addMuteButton(this);

    }

    placeDecorations() {

        const owned = DECORATIONS.filter(
            (d) => GameData.ownedDecorations.includes(d.name)
        );

        if (owned.length > 0) {
            this.add.text(
                240, 108,
                "Drag your decorations to arrange them ✨",
                {
                    fontFamily: "Arial",
                    fontSize: "16px",
                    color: "#5A3E1B",
                    stroke: "#FFFFFF",
                    strokeThickness: 3
                }
            ).setOrigin(0.5).setDepth(10);
        }

        owned.forEach((decoration) => {

            const saved = GameData.decorPositions[decoration.id];
            const x = saved ? saved.x : decoration.place.x;
            const y = saved ? saved.y : decoration.place.y;

            const obj = this.add.text(
                x, y,
                decoration.emoji,
                {
                    fontSize: decoration.place.size
                }
            ).setOrigin(0.5).setDepth(6);

            obj.setInteractive({ useHandCursor: true, draggable: true });
            this.input.setDraggable(obj);

            obj.on("drag", (pointer, dragX, dragY) => {
                obj.x = Phaser.Math.Clamp(dragX, 30, 450);
                obj.y = Phaser.Math.Clamp(dragY, 150, 690);
            });

            obj.on("dragend", () => {
                GameData.decorPositions[decoration.id] = {
                    x: Math.round(obj.x),
                    y: Math.round(obj.y)
                };
                GameData.save();
                AudioManager.click();
            });

        });

    }

    createSleepButton() {

        const button = this.add.rectangle(

            240,
            740,

            220,
            65,

            0x7ED957

        );

        button.setStrokeStyle(4, 0x4A7A2A);

        const text = this.add.text(

            240,
            740,

            "Sleep",

            {

                fontFamily: "Arial",
                fontSize: "28px",
                color: "#FFFFFF",
                fontStyle: "bold"

            }

        ).setOrigin(0.5);

        button.setInteractive({
            useHandCursor: true
        });

        button.on("pointerdown", () => {

            AudioManager.click();
            this.startNextDay();

        });

    }

    startNextDay() {

        GameData.day += 1;
        GameData.shoppingList = [];
        GameData.collectedItems = [];

        GameData.save();

        this.cameras.main.fadeOut(500, 0, 0, 0);

        this.time.delayedCall(500, () => {

            this.scene.start("ShoppingListScene");

        });

    }

}