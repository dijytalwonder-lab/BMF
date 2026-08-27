import GameData from "../data/GameData.js";

export default class ShoppingUI {

    constructor(scene) {

        this.scene = scene;
        this.shoppingTexts = [];

        this.popupPanel = null;
        this.popupText = null;

    }

    create() {

        // Sits above the drifting clouds so the objective stays readable
        const DEPTH = 100;

        // Panel grows to fit the day's list (3-5 items)
        const count = GameData.shoppingList.length;
        const rowH = 28;
        const firstRowY = 74;
        const lastRowY = firstRowY + (count - 1) * rowH;

        const panelTop = 26;
        const panelBottom = lastRowY + 20;
        this.bottomY = panelBottom;

        const panel = this.scene.add.rectangle(
            240,
            (panelTop + panelBottom) / 2,
            274,
            panelBottom - panelTop,
            0xFFFDF5,
            1
        );

        panel.setStrokeStyle(4, 0x8B6B3F);
        panel.setDepth(DEPTH);

        this.scene.add.text(
            240,
            44,
            "🧺 Shopping List",
            {
                fontFamily: "Arial",
                fontSize: "22px",
                fontStyle: "bold",
                color: "#5A3E1B"
            }
        ).setOrigin(0.5).setDepth(DEPTH + 1);

        GameData.shoppingList.forEach((item, index) => {

            const text = this.scene.add.text(

                125,
                firstRowY + index * rowH,

                `⬜ ${item.emoji} ${item.name}`,

                {
                    fontFamily: "Arial",
                    fontSize: "19px",
                    color: "#333333"
                }

            ).setDepth(DEPTH + 1);

            this.shoppingTexts.push(text);

        });

    }

    updateList() {

        GameData.shoppingList.forEach((item, index) => {

            if (
                GameData.collectedItems.includes(item.name)
            ) {

                this.shoppingTexts[index].setText(
                    `✅ ${item.emoji} ${item.name}`
                );

                this.shoppingTexts[index].setColor("#3A9D23");

            }

        });

    }

    showCatchPopup(item, success, message = "", callback = null) {

        // Remove previous popup if one exists
        if (this.popupPanel) {
            this.popupPanel.destroy();
        }

        if (this.popupText) {
            this.popupText.destroy();
        }

        this.popupPanel = this.scene.add.rectangle(
            240,
            250,
            340,
            170,
            0xFFFFFF,
            0.98
        );

        this.popupPanel.setStrokeStyle(
            4,
            success ? 0x4CAF50 : 0xD9534F
        );

        this.popupPanel.setDepth(110);

        const title = success
            ? "Collected!"
            : message;

        this.popupText = this.scene.add.text(

            240,
            240,

            `${title}\n\n${item.emoji} ${item.name}`,

            {
                fontFamily: "Arial",
                fontSize: "28px",
                color: "#4A3A24",
                align: "center"
            }

        ).setOrigin(0.5).setDepth(111);

        this.scene.time.delayedCall(1500, () => {

            if (this.popupPanel) {
                this.popupPanel.destroy();
                this.popupPanel = null;
            }

            if (this.popupText) {
                this.popupText.destroy();
                this.popupText = null;
            }

            if (callback) {
                callback();
            }

        });

    }

    showWinPopup(callback = null) {

    const panel = this.scene.add.rectangle(
        240,
        400,
        360,
        220,
        0xFFF8CC,
        0.98
    );

    panel.setStrokeStyle(5, 0xFFD700);
    panel.setDepth(110);

    const text = this.scene.add.text(

        240,
        370,

        "🎉\nShopping Complete!\n\nWell Done Luna!",

        {
            fontFamily: "Arial",
            fontSize: "30px",
            color: "#4A3A24",
            align: "center"
        }

    ).setOrigin(0.5).setDepth(111);

    const button = this.scene.add.rectangle(
        240,
        490,
        180,
        55,
        0x7ED957
    );

    button.setStrokeStyle(3, 0x4A7A2A);
    button.setDepth(111);

    const buttonText = this.scene.add.text(
        240,
        490,
        "Continue",
        {
            fontFamily: "Arial",
            fontSize: "24px",
            color: "#ffffff",
            fontStyle: "bold"
        }
    ).setOrigin(0.5).setDepth(112);

    button.setInteractive({ useHandCursor: true });

    button.on("pointerdown", () => {

        panel.destroy();
        text.destroy();
        button.destroy();
        buttonText.destroy();

        if (callback) {
            callback();
        }

    });

}

}