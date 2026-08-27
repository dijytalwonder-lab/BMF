import Phaser from "phaser";

import GameData from "./data/GameData.js";
import AudioManager from "./managers/AudioManager.js";

// Restore saved progress (coins, decorations, day) before the game starts
GameData.load();

// Browsers block audio until the first user gesture: unlock + start music then
const unlockAudio = () => {
    AudioManager.ensure();
    AudioManager.startMusic();
    window.removeEventListener("pointerdown", unlockAudio);
};
window.addEventListener("pointerdown", unlockAudio);

import LoadingScene from "./scenes/LoadingScene.js";
import HomeScene from "./scenes/HomeScene.js";
import ShoppingListScene from "./scenes/ShoppingListScene.js";
import MagicalTreeScene from "./scenes/MagicalTreeScene.js";
import FishingScene from "./scenes/FishingScene.js";
import CloudMarketScene from "./scenes/CloudMarketScene.js";
import SellingScene from "./scenes/SellingScene.js";
import DecorationShopScene from "./scenes/DecorationShopScene.js";
import HomeDecorationScene from "./scenes/HomeDecorationScene.js";

const config = {

    type: Phaser.AUTO,

    parent: "game",

    width: 480,
    height: 800,

    backgroundColor: "#E8F8FF",

    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },

    scene: [
    LoadingScene,
    HomeScene,
    ShoppingListScene,
    MagicalTreeScene,
    FishingScene,
    CloudMarketScene,
    SellingScene,
    DecorationShopScene,
    HomeDecorationScene
]

};

const game = new Phaser.Game(config);

// Debug hook (harmless; handy for testing scene state in the console)
window.game = game;