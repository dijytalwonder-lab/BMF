import Phaser from "phaser";
import GameData from "../data/GameData.js";
import AudioManager from "../managers/AudioManager.js";
import ITEMS from "../data/items.js";

export default class SellingScene extends Phaser.Scene {

    constructor() {
        super("SellingScene");
    }

    create() {

        this.cameras.main.fadeIn(500, 255, 255, 255);
        this.currentItem = 0;
this.totalCoinsEarned = 0;

        this.createBackground();

        this.createTitle();

        this.createCounter();

        this.createFairy();

        this.createBunny();

        this.createCoinDisplay();

        this.time.delayedCall(1000, () => {

            this.startSelling();

        });

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
            60,
            "☁ Selling Today's Catch ☁",
            {
                fontFamily: "Arial",
                fontSize: "30px",
                fontStyle: "bold",
                color: "#4A3A24"
            }
        ).setOrigin(0.5);

    }

    createCounter() {

        this.add.image(
            240,
            500,
            "marketCounter"
        ).setScale(0.5);

    }

    createFairy() {

        this.fairy = this.add.image(
            110,
            250,
            "fairy"
        );

        this.fairy.setScale(0.18);

        this.tweens.add({

            targets: this.fairy,

            y: 240,

            duration: 1000,

            yoyo: true,

            repeat: -1

        });

    }

    createBunny() {

        this.bunny = this.add.image(
            370,
            510,
            "bunny"
        );

        this.bunny.setScale(0.18);

    }

    createCoinDisplay() {

        this.coinIcon = this.add.image(
            380,
            110,
            "coin"
        );

        this.coinIcon.setScale(0.16);

        this.coinText = this.add.text(
    410,
    95,
    GameData.coins.toString(),

            {

                fontFamily: "Arial",

                fontSize: "28px",

                color: "#4A3A24",

                fontStyle: "bold"

            }

        );

    }

    startSelling() {

    this.sellNextItem();

}
sellNextItem() {

    if (this.currentItem >= GameData.shoppingList.length) {

        this.finishSelling();
        return;

    }

    const item = GameData.shoppingList[this.currentItem];

    this.itemSprite = this.add.text(

        240,
        180,

        item.emoji,

        {
            fontSize: "70px"
        }

    ).setOrigin(0.5);

    this.tweens.add({

        targets: this.itemSprite,

        y: 430,

        duration: 700,

        ease: "Bounce.easeOut",

        onComplete: () => {

            this.sellCurrentItem(item);

        }

    });

}
sellCurrentItem(item) {

    const value = this.add.text(

        240,
        390,

        `+${item.value}`,

        {

            fontFamily: "Arial",
            fontSize: "34px",
            fontStyle: "bold",
            color: "#FFD700"

        }

    ).setOrigin(0.5);

    GameData.coins += item.value;

    this.totalCoinsEarned += item.value;

    AudioManager.coin();

    this.tweens.add({

        targets: value,

        y: 330,

        alpha: 0,

        duration: 900,

        onComplete: () => {

            value.destroy();
            this.itemSprite.destroy();

            this.coinText.setText(GameData.coins);

            this.currentItem++;

            this.sellNextItem();

        }

    });

}

finishSelling() {

    GameData.save();

    this.add.text(

        240,
        600,

        `Today's Earnings\n💰 ${this.totalCoinsEarned} Coins`,

        {

            fontFamily: "Arial",
            fontSize: "32px",
            color: "#4A3A24",
            align: "center",
            fontStyle: "bold"

        }

    ).setOrigin(0.5);

    const button = this.add.rectangle(

        240,
        710,

        220,
        70,

        0x7ED957

    );

    button.setStrokeStyle(4, 0x4A7A2A);

    const text = this.add.text(

        240,
        710,

        "Continue",

        {

            fontFamily: "Arial",
            fontSize: "28px",
            color: "#FFFFFF",
            fontStyle: "bold"

        }

    ).setOrigin(0.5);

    button.setInteractive({ useHandCursor: true });

    button.on("pointerdown", () => {

        AudioManager.click();

        this.cameras.main.fadeOut(400);

this.time.delayedCall(400, () => {

    this.scene.start("DecorationShopScene");

});

    });

}


}