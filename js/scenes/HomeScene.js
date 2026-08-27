import Phaser from "phaser";
import GameData from "../data/GameData.js";
import AudioManager from "../managers/AudioManager.js";

export default class HomeScene extends Phaser.Scene {

    constructor() {
        super("HomeScene");
    }

    create() {

        // Fade in
        this.cameras.main.fadeIn(400, 0, 0, 0);

        // Background
        this.add.image(
            240,
            400,
            "homeBackground"
        );

        // House
        const house = this.add.image(
            240,
            500,
            "bunnyHouse"
        );

        house.setScale(0.45);

        // Title
        this.add.text(
            240,
            90,
            "Bunny's Magical Fishing",
            {
                fontFamily: "Arial",
                fontSize: "32px",
                color: "#ffffff",
                fontStyle: "bold",
                stroke: "#4A4A4A",
                strokeThickness: 6
            }
        ).setOrigin(0.5);

        // Show bunny only if she is outside
        if (!GameData.bunnyAtHome) {

            this.bunny = this.add.image(
                240,
                620,
                "bunny"
            );

            this.bunny.setScale(0.28);

            this.tweens.add({
                targets: this.bunny,
                y: this.bunny.y - 6,
                duration: 1200,
                yoyo: true,
                repeat: -1,
                ease: "Sine.easeInOut"
            });

        }

        // PLAY BUTTON

        const buttonImage = this.add.image(
            0,
            0,
            "playButton"
        );

        buttonImage.setScale(0.45);

        const buttonText = this.add.text(
            0,
            0,
            "PLAY",
            {
                fontFamily: "Arial",
                fontSize: "30px",
                color: "#FFFFFF",
                fontStyle: "bold",
                stroke: "#5A3E1B",
                strokeThickness: 6
            }
        ).setOrigin(0.5);

        this.playButton = this.add.container(
            240,
            720,
            [
                buttonImage,
                buttonText
            ]
        );

        this.playButton.setSize(
            buttonImage.displayWidth,
            buttonImage.displayHeight
        );

        this.playButton.setInteractive({
            useHandCursor: true
        });

        AudioManager.addMuteButton(this);

        // Hover

        this.playButton.on("pointerover", () => {

            this.tweens.add({
                targets: this.playButton,
                scaleX: 1.05,
                scaleY: 1.05,
                duration: 120
            });

        });

        this.playButton.on("pointerout", () => {

            this.tweens.add({
                targets: this.playButton,
                scaleX: 1,
                scaleY: 1,
                duration: 120
            });

        });

        // Click

        this.playButton.on("pointerdown", () => {

            AudioManager.click();

            // Bunny is leaving home
            GameData.bunnyAtHome = false;

            this.tweens.add({

                targets: this.playButton,

                scaleX: 0.95,

                scaleY: 0.95,

                duration: 80,

                yoyo: true,

                ease: "Quad.easeOut",

                onComplete: () => {

                    this.cameras.main.fadeOut(
                        400,
                        0,
                        0,
                        0
                    );

                    this.time.delayedCall(400, () => {

                        this.scene.start(
                            "ShoppingListScene"
                        );

                    });

                }

            });

        });

    }

}