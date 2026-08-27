import Phaser from "phaser";
import AudioManager from "../managers/AudioManager.js";

export default class CloudMarketScene extends Phaser.Scene {

    constructor() {
        super("CloudMarketScene");
    }

    create() {

        this.cameras.main.fadeIn(500, 255, 255, 255);

        this.createBackground();

        this.createTitle();

        this.createStall();

        this.createFairy();

        this.createBunny();

        this.showDialogue();

        this.createContinueButton();

    }

    createBackground() {

        this.add.image(
            240,
            400,
            "cloudMarketBackground"
        );

    }

    createTitle() {

        this.add.text(
            240,
            70,
            "☁ Cloud Market ☁",
            {
                fontFamily: "Arial",
                fontSize: "34px",
                color: "#4A3A24",
                fontStyle: "bold"
            }
        ).setOrigin(0.5);

    }

    createStall() {

        this.add.image(
            240,
            430,
            "cloudStall"
        ).setScale(0.42);

    }

    createFairy() {

        this.fairy = this.add.image(
            120,
            280,
            "fairy"
        );

        this.fairy.setScale(0.18);

        this.tweens.add({

            targets: this.fairy,

            y: 270,

            duration: 1000,

            yoyo: true,

            repeat: -1,

            ease: "Sine.easeInOut"

        });

    }

    createBunny() {

        this.bunny = this.add.image(
            360,
            500,
            "bunny"
        );

        this.bunny.setScale(0.20);

    }

    showDialogue() {

        const panel = this.add.rectangle(
            240,
            690,
            420,
            95,
            0xFFFFFF,
            0.95
        );

        panel.setStrokeStyle(
            4,
            0x8B6B3F
        );

        this.add.text(
            240,
            690,
            "Wonderful work, Luna!\nLet's sell today's catch.",
            {
                fontFamily: "Arial",
                fontSize: "24px",
                color: "#4A3A24",
                align: "center"
            }
        ).setOrigin(0.5);

    }

    createContinueButton() {

        const button = this.add.rectangle(
            240,
            770,
            180,
            50,
            0x7ED957
        );

        button.setStrokeStyle(
            3,
            0x4A7A2A
        );

        const text = this.add.text(
            240,
            770,
            "Continue",
            {
                fontFamily: "Arial",
                fontSize: "24px",
                color: "#FFFFFF",
                fontStyle: "bold"
            }
        ).setOrigin(0.5);

        button.setInteractive({
            useHandCursor: true
        });

        button.on("pointerdown", () => {

            AudioManager.click();

            this.cameras.main.fadeOut(
                400,
                255,
                255,
                255
            );

            this.time.delayedCall(400, () => {

                this.scene.start("SellingScene");

            });

        });

    }

}