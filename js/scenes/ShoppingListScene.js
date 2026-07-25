import Phaser from "phaser";
import ITEMS from "../data/items.js";
import GameData from "../data/GameData.js";

export default class ShoppingListScene extends Phaser.Scene {

    constructor() {
        super("ShoppingListScene");
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

        // Scene Title
        this.add.text(
            240,
            70,
            "Today's Shopping List",
            {
                fontFamily: "Arial",
                fontSize: "34px",
                fontStyle: "bold",
                color: "#4A2E16"
            }
        ).setOrigin(0.5);

        // Generate today's shopping list
        const shoppingList = Phaser.Utils.Array
            .Shuffle([...ITEMS])
            .slice(0, 3);

        GameData.shoppingList = shoppingList;
        GameData.collectedItems = [];

        //-----------------------------------
        // Bunny
        //-----------------------------------

        this.bunny = this.add.image(
            -80,
            585,
            "bunny"
        );

        this.bunny.setScale(0.22);

        this.tweens.add({

            targets: this.bunny,

            x: 135,

            duration: 700,

            ease: "Back.easeOut",

            onComplete: () => {

                this.tweens.add({

                    targets: this.bunny,

                    y: 580,

                    duration: 900,

                    yoyo: true,

                    repeat: -1,

                    ease: "Sine.easeInOut"

                });

            }

        });

        //-----------------------------------
        // Parchment
        //-----------------------------------

        this.paper = this.add.image(

            330,
            355,

            "shoppingParchment"

        );

        this.paper.setScale(0);

        this.time.delayedCall(700, () => {

            this.tweens.add({

                targets: this.paper,

                scale: 0.62,

                duration: 450,

                ease: "Back.easeOut"

            });

        });

        //-----------------------------------
        // Parchment Title
        //-----------------------------------

        this.time.delayedCall(1100, () => {

            this.add.text(

                330,
                235,

                "Shopping List",

                {

                    fontFamily: "Arial",

                    fontSize: "24px",

                    fontStyle: "bold",

                    color: "#5A3E1B"

                }

            ).setOrigin(0.5);

        });

        //-----------------------------------
        // Shopping Items
        //-----------------------------------

        shoppingList.forEach((item, index) => {

            this.time.delayedCall(

                1400 + index * 250,

                () => {

                    const row = this.add.text(

                        250,

                        285 + index * 55,

                        `${item.emoji}   ${item.name}`,

                        {

                            fontFamily: "Arial",

                            fontSize: "24px",

                            color: "#333333"

                        }

                    );

                    row.setAlpha(0);

                    row.y += 15;

                    this.tweens.add({

                        targets: row,

                        alpha: 1,

                        y: row.y - 15,

                        duration: 250

                    });

                }

            );

        });

        //-----------------------------------
        // Start Button
        //-----------------------------------

        const startButton = this.add.rectangle(

            240,
            710,

            240,
            70,

            0x7ED957

        );

        startButton.setStrokeStyle(
            4,
            0x4A7A2A
        );

        const startText = this.add.text(

            240,
            710,

            "Start Journey",

            {

                fontFamily: "Arial",

                fontSize: "28px",

                color: "#FFFFFF",

                fontStyle: "bold"

            }

        ).setOrigin(0.5);

        startButton.setAlpha(0);
        startText.setAlpha(0);

        this.time.delayedCall(2400, () => {

            this.tweens.add({

                targets: [startButton, startText],

                alpha: 1,

                duration: 350

            });

        });

        //-----------------------------------
        // Button Animation
        //-----------------------------------

        startButton.setInteractive({

            useHandCursor: true

        });

        startButton.on("pointerover", () => {

            this.tweens.add({

                targets: [startButton, startText],

                scaleX: 1.05,

                scaleY: 1.05,

                duration: 120

            });

        });

        startButton.on("pointerout", () => {

            this.tweens.add({

                targets: [startButton, startText],

                scaleX: 1,

                scaleY: 1,

                duration: 120

            });

        });

        startButton.on("pointerdown", () => {

            this.tweens.add({

                targets: [startButton, startText],

                scaleX: 0.95,

                scaleY: 0.95,

                duration: 80,

                yoyo: true,

                onComplete: () => {

                    this.cameras.main.fadeOut(400, 0, 0, 0);

                    this.time.delayedCall(400, () => {

                        this.scene.start("MagicalTreeScene");

                    });

                }

            });

        });

    }

}