import Phaser from "phaser";
import GameData from "../data/GameData.js";
import AudioManager from "../managers/AudioManager.js";
import DECORATIONS from "../data/decorations.js";

export default class DecorationShopScene extends Phaser.Scene {

    constructor() {
        super("DecorationShopScene");
    }

    create() {

        this.cameras.main.fadeIn(500, 255, 255, 255);

        this.cameras.main.setBackgroundColor("#DDF7FF");

        this.decorations = DECORATIONS;

        this.createUI();

    }

    createUI() {

        this.add.text(

            240,
            50,

            "🏡 Decoration Shop",

            {

                fontFamily: "Arial",
                fontSize: "34px",
                color: "#4A3A24",
                fontStyle: "bold"

            }

        ).setOrigin(0.5);

        this.coinText = this.add.text(

            240,
            100,

            `💰 Coins : ${GameData.coins}`,

            {

                fontFamily: "Arial",
                fontSize: "28px",
                color: "#C98C00",
                fontStyle: "bold"

            }

        ).setOrigin(0.5);

        this.decorations.forEach((item, index) => {

            this.createDecorationCard(item, index);

        });

        this.createContinueButton();

    }

    createDecorationCard(item, index) {

        const y = 165 + index * 93;

        const panel = this.add.rectangle(

            240,
            y,

            420,
            80,

            0xFFFFFF,
            0.95

        );

        panel.setStrokeStyle(3, 0x8B6B3F);

        this.add.text(

            70,
            y,

            item.emoji,

            {

                fontSize: "42px"

            }

        ).setOrigin(0.5);

        this.add.text(

            120,
            y - 18,

            item.name,

            {

                fontFamily: "Arial",
                fontSize: "24px",
                color: "#333333",
                fontStyle: "bold"

            }

        );

        this.add.text(

            120,
            y + 15,

            `${item.cost} Coins`,

            {

                fontFamily: "Arial",
                fontSize: "20px",
                color: "#666666"

            }

        );

        const button = this.add.rectangle(

            380,
            y,

            70,
            42,

            0x7ED957

        );

        button.setStrokeStyle(3, 0x4A7A2A);

        const buttonText = this.add.text(

            380,
            y,

            "BUY",

            {

                fontFamily: "Arial",
                fontSize: "18px",
                color: "#FFFFFF",
                fontStyle: "bold"

            }

        ).setOrigin(0.5);

        // Already owned

        if (GameData.ownedDecorations.includes(item.name)) {

            button.disableInteractive();

            button.setFillStyle(0x999999);

            buttonText.setText("OWNED");

        }

        else {

            button.setInteractive({

                useHandCursor: true

            });

            button.on("pointerdown", () => {

                this.buyDecoration(

                    item,
                    button,
                    buttonText

                );

            });

        }

    }

    buyDecoration(item, button, buttonText) {

        if (GameData.coins < item.cost) {

            AudioManager.miss();
            this.showMessage("Not enough coins!");

            return;

        }

        if (GameData.ownedDecorations.includes(item.name)) {

            return;

        }

        GameData.coins -= item.cost;

        GameData.ownedDecorations.push(item.name);

        GameData.save();

        this.coinText.setText(

            `💰 Coins : ${GameData.coins}`

        );

        button.disableInteractive();

        button.setFillStyle(0x999999);

        buttonText.setText("OWNED");

        AudioManager.coin();
        this.showMessage(`Purchased ${item.emoji}`);

    }

    showMessage(message) {

        const text = this.add.text(

            240,
            680,

            message,

            {

                fontFamily: "Arial",
                fontSize: "24px",
                color: "#4A3A24",
                backgroundColor: "#FFFFFF",
                padding: {

                    left: 12,
                    right: 12,
                    top: 8,
                    bottom: 8

                }

            }

        ).setOrigin(0.5);

        this.tweens.add({

            targets: text,

            alpha: 0,

            y: 650,

            duration: 1200,

            onComplete: () => {

                text.destroy();

            }

        });

    }

    createContinueButton() {

        const button = this.add.rectangle(

            240,
            740,

            220,
            60,

            0x7ED957

        );

        button.setStrokeStyle(

            4,
            0x4A7A2A

        );

        const text = this.add.text(

            240,
            740,

            "Continue",

            {

                fontFamily: "Arial",
                fontSize: "26px",
                color: "#FFFFFF",
                fontStyle: "bold"

            }

        ).setOrigin(0.5);

        button.setInteractive({

            useHandCursor: true

        });

        button.on("pointerdown", () => {

            AudioManager.click();

            // Bunny has returned home

            GameData.bunnyAtHome = true;

            this.scene.start(

                "HomeDecorationScene"

            );

        });

        AudioManager.addMuteButton(this);

    }

}