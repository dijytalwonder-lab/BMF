import Phaser from "phaser";

export default class LoadingScene extends Phaser.Scene {

    constructor() {
        super("LoadingScene");
    }

    preload() {

        this.add.text(
            240,
            380,
            "Loading...",
            {
                fontFamily: "Arial",
                fontSize: "28px",
                color: "#ffffff"
            }
        ).setOrigin(0.5);

        // Background
        this.load.image(
            "homeBackground",
            "images/backgrounds/home_background.png"
        );

        // Bunny
        this.load.image(
            "bunny",
            "images/bunny/bunny_idle.png"
        );

        // House
        this.load.image(
            "bunnyHouse",
            "images/house/bunny_house.png"
        );

        // Tree
        this.load.image(
            "magicalTree",
            "images/tree/magical_tree.png"
        );

        // Fairy
        this.load.image(
            "fairy",
            "images/fairy/fairy_idle.png"
        );

        // Portal
        this.load.image(
            "cloudPortal",
            "images/effects/cloud_portal.png"
        );

        // Fishing
        this.load.image(
            "boat",
            "images/fishing/boat.png"
        );

        this.load.image(
            "water",
            "images/fishing/water.png"
        );

        this.load.image(
            "clouds",
            "images/fishing/clouds.png"
        );

        this.load.image(
            "fishingRod",
            "images/fishing/fishing_rod.png"
        );

        // UI
        this.load.image(
            "bobber",
            "images/ui/magical_bobber.png"
        );

        this.load.image(
            "playButton",
            "images/ui/play_button.png"
        );

// Shopping parchment
this.load.image(
    "shoppingParchment",
    "images/ui/shopping_parchment.png"
);

        this.load.image(
            "cloudMarketBackground",
            "images/backgrounds/cloud_market_background.png"
        );

        this.load.image(
            "cloudStall",
            "images/market/cloud_stall.png"
        );

        this.load.image(
            "marketCounter",
            "images/market/market_counter.png"
        );

        this.load.image(
            "coin",
            "images/ui/coin.png"
        );

        

    }

    create() {

        //this.scene.start("HomeScene");
        this.scene.start("HomeScene");

    }

}