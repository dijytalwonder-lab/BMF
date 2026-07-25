import Phaser from "phaser";
import GameData from "../data/GameData.js";
import ITEMS from "../data/items.js";
import FishingManager from "../managers/FishingManager.js";
import Boat from "../components/Boat.js";
import Bunny from "../components/Bunny.js";
import FishingRod from "../components/FishingRod.js";
import Bobber from "../components/Bobber.js";
import ShoppingUI from "../components/ShoppingUI.js";

export default class FishingScene extends Phaser.Scene {

    constructor() {
        super("FishingScene");
    }

    create() {

    this.isFishing = false;
    this.waitingForBite = false;
    this.canFish = false;

    this.fishingManager = new FishingManager(this);

    //--------------------------------------------------
    // Background
    //--------------------------------------------------

    this.createBackground();

    this.shoppingUI = new ShoppingUI(this);
    this.shoppingUI.create();

    this.createClouds();
    this.createWater();

    //--------------------------------------------------
    // Boat
    //--------------------------------------------------

    const boat = new Boat(this);
    this.boatContainer = boat.create();

    //--------------------------------------------------
    // Portal
    //--------------------------------------------------

    this.portal = this.add.image(
        240,
        140,
        "cloudPortal"
    );

    this.portal.setScale(0.42);

    this.portal.setDepth(50);

    this.tweens.add({

        targets: this.portal,

        angle: 360,

        duration: 15000,

        repeat: -1,

        ease: "Linear"

    });

    //--------------------------------------------------
    // Bunny
    //--------------------------------------------------

    const bunny = new Bunny(
        this,
        this.boatContainer
    );

    this.bunny = bunny.create();

    this.bunny.setVisible(false);

    //--------------------------------------------------
    // Rod
    //--------------------------------------------------

    this.rod = new FishingRod(
        this,
        this.boatContainer
    ).create();

    this.rod.rod.setVisible(false);

    //--------------------------------------------------
    // Bobber
    //--------------------------------------------------

    this.lineGraphics =
        this.fishingManager.createFishingLine();

    const bobber = new Bobber(this);

    this.bobber = bobber;

    this.hook = bobber.create();

    //--------------------------------------------------
    // Intro Animation
    //--------------------------------------------------

    this.playIntroAnimation();

}

playIntroAnimation() {

    //--------------------------------------------------
    // Bunny appears from portal
    //--------------------------------------------------

    this.bunny.setVisible(true);

    this.boatContainer.x = 240;
    this.boatContainer.y = 140;

    this.boatContainer.setScale(0.08);

    this.tweens.add({

        targets: this.boatContainer,

        y: 420,

        scaleX: 1,

        scaleY: 1,

        duration: 2200,

        ease: "Sine.easeOut",

        onComplete: () => {

            //--------------------------------------------------
            // Portal disappears
            //--------------------------------------------------

            this.tweens.add({

                targets: this.portal,

                alpha: 0,

                duration: 500,

                onComplete: () => {

                    this.portal.destroy();

                }

            });

            //--------------------------------------------------
            // Magical sparkles
            //--------------------------------------------------

            for (let i = 0; i < 12; i++) {

                const sparkle = this.add.circle(

                    Phaser.Math.Between(180,300),
                    Phaser.Math.Between(220,420),

                    3,

                    0xffffff

                );

                this.tweens.add({

                    targets: sparkle,

                    alpha:0,

                    scale:3,

                    duration:700,

                    delay:i*40,

                    onComplete:()=>{

                        sparkle.destroy();

                    }

                });

            }

            //--------------------------------------------------
            // Rod magically appears
            //--------------------------------------------------

            this.time.delayedCall(500,()=>{

                this.rod.rod.setVisible(true);

                this.rod.rod.setScale(0);

                this.tweens.add({

                    targets:this.rod.rod,

                    scale:0.16,

                    duration:400,

                    ease:"Back.easeOut"

                });

            });

            //--------------------------------------------------
            // Enable Fishing
            //--------------------------------------------------

            this.time.delayedCall(900,()=>{

                this.canFish = true;

                this.add.text(

                    240,
                    70,

                    "Tap the water to cast your line",

                    {

                        fontFamily:"Arial",

                        fontSize:"24px",

                        color:"#ffffff",

                        stroke:"#333333",

                        strokeThickness:5

                    }

                ).setOrigin(0.5);

            });

        }

    });

}

startIntro(){

    // Open portal

    this.tweens.add({

        targets:this.portal,

        scale:0.42,

        duration:900,

        ease:"Back.easeOut"

    });

    this.tweens.add({

        targets:this.portal,

        angle:360,

        duration:14000,

        repeat:-1

    });

}

createFishShadows(){

    this.time.addEvent({

        delay:3500,

        loop:true,

        callback:()=>{

            const fish=this.add.ellipse(

                -30,

                Phaser.Math.Between(560,700),

                26,

                12,

                0x000000,

                0.12

            );

            this.tweens.add({

                targets:fish,

                x:520,

                duration:Phaser.Math.Between(5000,7000),

                ease:"Linear",

                onComplete:()=>{

                    fish.destroy();

                }

            });

        }

    });

}

createWaterAnimation(){

    this.tweens.add({

        targets:this.water,

        alpha:0.93,

        duration:900,

        yoyo:true,

        repeat:-1,

        ease:"Sine.easeInOut"

    });

}

startArrivalIntro() {

    //----------------------------------
    // Bunny appears inside portal
    //----------------------------------

    this.bunny.setVisible(true);

    this.bunny.setPosition(240,170);

    this.bunny.setScale(0.02);

    this.bunny.setAngle(-20);

    //----------------------------------
    // Fly out of portal
    //----------------------------------

    this.tweens.add({

        targets:this.bunny,

        x:240,

        y:300,

        scaleX:0.18,

        scaleY:0.18,

        angle:0,

        duration:1200,

        ease:"Back.easeOut",

        onComplete:()=>{

            this.landOnBoat();

        }

    });

}
landOnBoat(){

    this.tweens.add({

        targets:this.bunny,

        x:130,

        y:575,

        duration:1400,

        ease:"Sine.easeInOut",

        onComplete:()=>{

    this.tweens.add({

        targets:this.bunny,

        y:this.bunny.y+5,

        duration:120,

        yoyo:true,

        onComplete:()=>{

            this.showMagicRod();

        }

    });

}

    });

}

    createBackground() {

        this.cameras.main.setBackgroundColor("#BEEBFF");

    }

    createClouds() {

    this.cloud1 = this.add.image(
        120,
        90,
        "clouds"
    );

    this.cloud1.setScale(0.55);
    this.cloud1.setAlpha(0.8);

    this.cloud2 = this.add.image(
        360,
        150,
        "clouds"
    );

    this.cloud2.setScale(0.38);
    this.cloud2.setAlpha(0.65);

    this.cloud3 = this.add.image(
        250,
        60,
        "clouds"
    );

    this.cloud3.setScale(0.28);
    this.cloud3.setAlpha(0.55);

    this.tweens.add({

        targets:this.cloud1,

        x:170,

        duration:18000,

        repeat:-1,

        yoyo:true,

        ease:"Linear"

    });

    this.tweens.add({

        targets:this.cloud2,

        x:310,

        duration:14000,

        repeat:-1,

        yoyo:true,

        ease:"Linear"

    });

    this.tweens.add({

        targets:this.cloud3,

        x:300,

        duration:22000,

        repeat:-1,

        yoyo:true,

        ease:"Linear"

    });

}

    showMagicRod(){

    this.rod.setVisible(true);

    this.rod.setAlpha(0);

    this.rod.setScale(0.3);

    this.tweens.add({

        targets:this.rod,

        alpha:1,

        scaleX:1,

        scaleY:1,

        duration:600,

        ease:"Back.easeOut"

    });

    for(let i=0;i<12;i++){

        const star=this.add.circle(

            this.rod.x,

            this.rod.y,

            Phaser.Math.Between(2,4),

            0xFFF799

        );

        this.tweens.add({

            targets:star,

            x:star.x+Phaser.Math.Between(-40,40),

            y:star.y+Phaser.Math.Between(-40,40),

            alpha:0,

            duration:700,

            onComplete:()=>star.destroy()

        });

    }

    this.showStartFishingText();

}

showStartFishingText(){

    const txt=this.add.text(

        240,
        90,

        "Let's Fish!",

        {

            fontFamily:"Arial",

            fontSize:"34px",

            fontStyle:"bold",

            color:"#FFFFFF",

            stroke:"#35648A",

            strokeThickness:6

        }

    ).setOrigin(0.5);

    txt.setAlpha(0);

    this.tweens.add({

        targets:txt,

        alpha:1,

        duration:350,

        yoyo:true,

        hold:1000,

        onComplete:()=>{

            txt.destroy();

            this.canFish=true;

            this.tweens.add({

    targets: this.portal,

    alpha:0,

    scale:0.2,

    duration:500,

    onComplete:()=>{

        this.portal.destroy();

    }

});

        }

    });

}

    createWater() {

        this.water = this.add.image(
            240,
            640,
            "water"
        );

        this.water.setDisplaySize(480, 320);

        this.water.setInteractive();

        this.water.on("pointerdown", (pointer) => {

    // Ignore clicks until intro finishes
    if (!this.canFish) {
        return;
    }

    if (!this.canFish) return;

if (!this.isFishing) {

        this.castFishingLine(pointer.x, pointer.y);

    }

    else if (this.waitingForBite) {

        this.reelIn();

    }

});

    }

reelIn() {

    this.waitingForBite = false;

    // Stop bobber floating animation
    this.tweens.killTweensOf(this.hook);

    const tip = this.rod.getTipPosition();

const startX = tip.x;
const startY = tip.y;

    this.tweens.add({

        targets: this.hook,

        x: startX,
        y: startY,

        duration: 450,

        ease: "Sine.easeIn",

        onUpdate: () => {

            this.lineGraphics.clear();

            this.lineGraphics.lineStyle(
                1,
                0xE8E2D6,
                0.9
            );

            this.lineGraphics.beginPath();

            this.lineGraphics.moveTo(
                startX,
                startY
            );

            this.lineGraphics.lineTo(
                this.hook.x,
                this.hook.y
            );

            this.lineGraphics.strokePath();

        },

        onComplete: () => {

            // Remove the fishing line
            this.lineGraphics.clear();

            // Hide bobber
            this.hook.setVisible(false);

            // Reset rotation
            this.hook.setAngle(0);

            // Ready for next cast
            this.isFishing = false;
            this.waitingForBite = false;

            // Catch item
            this.catchRandomItem();

        }

    });

}
    catchRandomItem() {

    const item = Phaser.Utils.Array.GetRandom(ITEMS);

    const needed = GameData.shoppingList.some(
        shoppingItem => shoppingItem.name === item.name
    );

    const alreadyCollected = GameData.collectedItems.includes(
        item.name
    );

    if (!needed) {

        this.shoppingUI.showCatchPopup(

            item,

            false,

            "Not On Today's List!",

            () => {

                this.checkWinCondition();

            }

        );

        return;

    }

    if (alreadyCollected) {

        this.shoppingUI.showCatchPopup(

            item,

            false,

            "Already Collected!",

            () => {

                this.checkWinCondition();

            }

        );

        return;

    }

    // Correct item

    GameData.collectedItems.push(item.name);

    this.shoppingUI.updateList();

    this.shoppingUI.showCatchPopup(

        item,

        true,

        "",

        () => {

            this.checkWinCondition();

        }

    );

}
    checkWinCondition() {

    if (
        GameData.collectedItems.length ===
        GameData.shoppingList.length
    ) {

        this.shoppingUI.showWinPopup(() => {

            this.cameras.main.fadeOut(400, 0, 0, 0);

            this.time.delayedCall(400, () => {

                this.scene.start("CloudMarketScene");

            });

        });

    }

}

createPortal(){

    this.portal = this.add.image(

        240,

        120,

        "cloudPortal"

    );

    this.portal.setScale(0);

    this.portal.setDepth(50);

}

    castFishingLine(targetX, targetY) {
        if (this.isFishing) {

            return;

        }

        this.isFishing = true;

        this.lineGraphics.clear();

        const tip = this.rod.getTipPosition();

const startX = tip.x;
const startY = tip.y;

        this.hook.setPosition(startX, startY);
        this.hook.setVisible(true);

        this.tweens.add({

            targets: this.hook,

            x: targetX,

            y: targetY,

            duration: 450,

            ease: "Sine.easeOut",

            onUpdate: () => {

                this.lineGraphics.clear();

                this.lineGraphics.lineStyle(
                    1,
                    0xE8E2D6,
                    0.9
                );

                this.lineGraphics.beginPath();

                this.lineGraphics.moveTo(
                    startX,
                    startY
                );

                this.lineGraphics.lineTo(
                    this.hook.x,
                    this.hook.y
                );

                this.lineGraphics.strokePath();

            },

            onComplete: () => {

                this.createSplash(targetX, targetY);

                this.startWaitingForBite();

            }

        });

    }

    createSplash(x,y){

    const splash=this.add.circle(

        x,
        y,

        8,

        0xFFFFFF

    );

    splash.setAlpha(0.8);

    this.tweens.add({

        targets:splash,

        scale:3,

        alpha:0,

        duration:350,

        onComplete:()=>{

            splash.destroy();

        }

    });

    for(let i=0;i<6;i++){

        const sparkle=this.add.circle(

            x,

            y,

            2,

            0xFFF799

        );

        this.tweens.add({

            targets:sparkle,

            x:x+Phaser.Math.Between(-20,20),

            y:y+Phaser.Math.Between(-20,20),

            alpha:0,

            duration:500,

            onComplete:()=>sparkle.destroy()

        });

    }

}

    startWaitingForBite() {

        this.waitingForBite = true;

        const waitTime = Phaser.Math.Between(
            1500,
            3500
        );

        this.time.delayedCall(waitTime, () => {

            this.showBite();

        });

    }
    showBite() {

    // Stop any previous animation on the bobber
    this.tweens.killTweensOf(this.hook);

    this.waitingForBite = true;

    this.tweens.add({

        targets: this.hook,

        y: this.hook.y + 8,

        angle: 18,

        duration: 120,

        yoyo: true,

        repeat: 4,

        onComplete: () => {

            // Reset bobber angle
            this.hook.setAngle(0);

            // Gentle floating while waiting for player to reel in
            this.tweens.add({

                targets: this.hook,

                y: this.hook.y - 3,

                duration: 900,

                yoyo: true,

                repeat: -1,

                ease: "Sine.easeInOut"

            });

        }

    });

}

}