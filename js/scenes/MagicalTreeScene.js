import Phaser from "phaser";

export default class MagicalTreeScene extends Phaser.Scene {

    constructor() {
        super("MagicalTreeScene");
    }

    create() {

    this.cameras.main.fadeIn(700, 0, 0, 0);

    //------------------------------------------------
    // Background
    //------------------------------------------------

    this.background = this.add.image(
        240,
        400,
        "homeBackground"
    );
    this.background.setDepth(0);

    //------------------------------------------------
    // Tree
    //------------------------------------------------

    this.tree = this.add.image(
        250,
        430,
        "magicalTree"
    );

    this.tree.setScale(0.55);
    this.tree.setDepth(5);

    //------------------------------------------------
    // Bunny
    //------------------------------------------------

    this.bunny = this.add.image(
        -70,
        590,
        "bunny"
    );

    this.bunny.setScale(0.22);
    this.bunny.setDepth(20);

    this.tweens.add({

        targets: this.bunny,

        x: 120,

        duration: 1500,

        ease: "Sine.easeOut"

    });

    //------------------------------------------------
    // Fairy
    //------------------------------------------------

    this.fairy = this.add.image(
        240,
        -80,
        "fairy"
    );

    this.fairy.setScale(0.18);
    this.fairy.setAlpha(0);
    this.fairy.setDepth(30);

    //------------------------------------------------
    // Fairy enters
    //------------------------------------------------

    this.time.delayedCall(1700, () => {

        this.tweens.add({

            targets: this.fairy,

            y: 170,
            alpha: 1,

            duration: 1200,

            ease: "Sine.easeOut",

            onComplete: () => {

                // Floating animation
                this.tweens.add({

                    targets: this.fairy,

                    y: 160,

                    duration: 900,

                    yoyo: true,

                    repeat: -1,

                    ease: "Sine.easeInOut"

                });

                this.showDialogue();

            }

        });

    });

}

    //----------------------------------------------------
    // Fairy Dialogue
    //----------------------------------------------------

    showDialogue(){

        this.dialogue = this.add.text(
    240,
    90,
    "Good luck, Luna!\nLet's visit the Cloud Lake!",
    {
        fontFamily: "Arial",
        fontSize: "24px",
        align: "center",
        color: "#FFFFFF",
        stroke: "#4A3A24",
        strokeThickness: 5
    }
)
.setOrigin(0.5)
.setDepth(50);
        //----------------------------------------
        // Keep dialogue for 3 seconds
        //----------------------------------------

        this.time.delayedCall(3000,()=>{

            this.dialogue.destroy();

            this.openPortal();

        });

    }

    //----------------------------------------------------
    // Portal
    //----------------------------------------------------

    openPortal(){

        this.portal=this.add.image(

            370,
            250,

            "cloudPortal"

        );

        this.portal.setScale(0);

        this.portal.setDepth(10);

        //----------------------------------------
        // Portal grows once
        //----------------------------------------

        this.tweens.add({

            targets:this.portal,

            scale:0.45,

            duration:900,

            ease:"Back.easeOut"

        });

        //----------------------------------------
        // Slow rotation only
        //----------------------------------------

        this.tweens.add({

            targets:this.portal,

            angle:360,

            duration:18000,

            repeat:-1,

            ease:"Linear"

        });

        //----------------------------------------
        // Bunny enters portal after 1.5 sec
        //----------------------------------------

        this.time.delayedCall(1500,()=>{

            this.enterPortal();

        });

    }

    //----------------------------------------------------
    // Bunny enters portal
    //----------------------------------------------------

    enterPortal(){

        this.tweens.add({

            targets:this.bunny,

            x:365,

            y:255,

            scaleX:0.02,

            scaleY:0.02,

            angle:20,

            duration:2200,

            ease:"Sine.easeInOut",

            onComplete:()=>{

                this.bunny.setVisible(false);

                this.finishScene();

            }

        });

    }

    //----------------------------------------------------
    // Finish
    //----------------------------------------------------

    finishScene(){

        this.time.delayedCall(700,()=>{

            this.cameras.main.fadeOut(700,0,0,0);

            this.time.delayedCall(700,()=>{

                this.scene.start("FishingScene");

            });

        });

    }


}