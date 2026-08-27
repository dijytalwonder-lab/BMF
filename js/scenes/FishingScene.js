import Phaser from "phaser";
import GameData from "../data/GameData.js";
import AudioManager from "../managers/AudioManager.js";
import FishingManager from "../managers/FishingManager.js";
import Boat from "../components/Boat.js";
import Bunny from "../components/Bunny.js";
import FishingRod from "../components/FishingRod.js";
import Bobber from "../components/Bobber.js";
import ShoppingUI from "../components/ShoppingUI.js";

// -------------------------------------------------------------
// Fishing minigame tuning
// -------------------------------------------------------------
const ZONES = {
    shallow: { neededChance: 0.35, catchWidth: 92, markerSpeed: 300, bonus: 2, color: 0x7ED957 },
    mid:     { neededChance: 0.60, catchWidth: 66, markerSpeed: 430, bonus: 5, color: 0xFFC93C },
    deep:    { neededChance: 0.90, catchWidth: 46, markerSpeed: 580, bonus: 10, color: 0xFF7BAC }
};

const BAR_LEFT = 90;
const BAR_RIGHT = 390;
const BAR_Y = 430;

// Where the boat sits on the water surface (water spans y 480-800)
const BOAT_REST_Y = 560;

export default class FishingScene extends Phaser.Scene {

    constructor() {
        super("FishingScene");
    }

    create() {

        // Game states: intro | idle | charging | casting | waiting | minigame | resolving | won | failed
        this.state = "intro";
        this.combo = 0;
        this.currentZone = "shallow";

        // Skip the portal fly-in when retrying a failed day
        const data = this.scene.settings.data || {};
        this.isRetry = !!data.retry;

        // Day difficulty: timer + lives
        const cfg = GameData.dayConfig();
        this.timeLeft = cfg.time;
        this.maxLives = cfg.lives;
        this.lives = cfg.lives;

        this.fishingManager = new FishingManager(this);

        this.createBackground();

        this.shoppingUI = new ShoppingUI(this);
        this.shoppingUI.create();

        this.createClouds();
        this.createWater();
        this.createWaterAnimation();   // shimmer (was written but never called)
        this.createFishShadows();      // swimming shadows (was written but never called)

        // Boat
        const boat = new Boat(this);
        this.boatContainer = boat.create();

        // Portal
        this.portal = this.add.image(240, 140, "cloudPortal");
        this.portal.setScale(0.42);
        this.portal.setDepth(50);
        this.tweens.add({
            targets: this.portal,
            angle: 360,
            duration: 15000,
            repeat: -1,
            ease: "Linear"
        });

        // Bunny (rides the boat)
        const bunny = new Bunny(this, this.boatContainer);
        this.bunny = bunny.create();
        this.bunny.setVisible(false);

        // Rod
        this.rod = new FishingRod(this, this.boatContainer).create();
        this.rod.rod.setVisible(false);

        // Fishing line + bobber
        this.lineGraphics = this.fishingManager.createFishingLine();
        this.lineGraphics.setDepth(40);

        this.hook = new Bobber(this).create();
        this.hook.setDepth(41);

        this.createHud();

        this.muteButton = AudioManager.addMuteButton(this);

        // Single input surface: tap anywhere on the scene
        this.input.on("pointerdown", this.onPointerDown, this);
        this.input.on("pointerup", this.onPointerUp, this);

        if (this.isRetry) {
            this.skipIntro();
        } else {
            this.playIntroAnimation();
        }

    }

    // Retry: place boat/rod immediately, no portal fly-in
    skipIntro() {

        this.portal.destroy();

        this.bunny.setVisible(true);
        this.boatContainer.setPosition(240, BOAT_REST_Y);
        this.boatContainer.setScale(1);
        this.startBoatBob();

        this.rod.rod.setVisible(true);
        this.rod.rod.setScale(0.16);

        this.startFishing();

    }

    // ---------------------------------------------------------
    // Scenery
    // ---------------------------------------------------------

    createBackground() {
        this.cameras.main.setBackgroundColor("#BEEBFF");
    }

    createClouds() {

        this.cloud1 = this.add.image(120, 90, "clouds").setScale(0.55).setAlpha(0.8);
        this.cloud2 = this.add.image(360, 150, "clouds").setScale(0.38).setAlpha(0.65);
        this.cloud3 = this.add.image(250, 60, "clouds").setScale(0.28).setAlpha(0.55);

        this.tweens.add({ targets: this.cloud1, x: 170, duration: 18000, repeat: -1, yoyo: true, ease: "Linear" });
        this.tweens.add({ targets: this.cloud2, x: 310, duration: 14000, repeat: -1, yoyo: true, ease: "Linear" });
        this.tweens.add({ targets: this.cloud3, x: 300, duration: 22000, repeat: -1, yoyo: true, ease: "Linear" });

    }

    createWater() {

        this.water = this.add.image(240, 640, "water");
        this.water.setDisplaySize(480, 320);

    }

    createWaterAnimation() {

        this.tweens.add({
            targets: this.water,
            alpha: 0.93,
            duration: 900,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut"
        });

    }

    createFishShadows() {

        this.time.addEvent({
            delay: 3500,
            loop: true,
            callback: () => {

                if (!this.scene.isActive()) {
                    return;
                }

                const fish = this.add.ellipse(
                    -30,
                    Phaser.Math.Between(600, 730),
                    26, 12,
                    0x000000, 0.12
                );

                this.tweens.add({
                    targets: fish,
                    x: 520,
                    duration: Phaser.Math.Between(5000, 7000),
                    ease: "Linear",
                    onComplete: () => fish.destroy()
                });

            }
        });

    }

    // ---------------------------------------------------------
    // HUD: instruction, combo, power meter, reaction bar
    // ---------------------------------------------------------

    createHud() {

        // Instruction sits BELOW the shopping panel, which varies in height
        const belowPanel = (this.shoppingUI.bottomY || 150) + 24;

        this.instruction = this.add.text(
            240, belowPanel, "",
            {
                fontFamily: "Arial",
                fontSize: "20px",
                color: "#ffffff",
                align: "center",
                stroke: "#35648A",
                strokeThickness: 4
            }
        ).setOrigin(0.5).setDepth(60);

        this.comboText = this.add.text(
            240, belowPanel + 34, "",
            {
                fontFamily: "Arial",
                fontSize: "22px",
                fontStyle: "bold",
                color: "#FFD700",
                stroke: "#5A3E1B",
                strokeThickness: 4
            }
        ).setOrigin(0.5).setDepth(60);

        // ---- Timer (top-right) + lives (top-left), above the shopping panel ----
        this.timerText = this.add.text(
            434, 42, "",
            {
                fontFamily: "Arial",
                fontSize: "24px",
                fontStyle: "bold",
                color: "#ffffff",
                stroke: "#35648A",
                strokeThickness: 5
            }
        ).setOrigin(0.5).setDepth(101);

        this.livesText = this.add.text(
            48, 42, "",
            {
                fontFamily: "Arial",
                fontSize: "20px"
            }
        ).setOrigin(0.5).setDepth(101);

        // ---- Power meter (hidden until charging) ----
        this.powerGroup = this.add.container(0, 0).setDepth(60);
        const pmBg = this.add.rectangle(240, 765, 300, 26, 0x2B4A63, 0.85).setStrokeStyle(3, 0xffffff);
        this.powerFill = this.add.rectangle(240 - 150, 765, 0, 18, 0x7ED957).setOrigin(0, 0.5);
        const pmLabel = this.add.text(240, 738, "POWER", {
            fontFamily: "Arial", fontSize: "16px", fontStyle: "bold",
            color: "#ffffff", stroke: "#35648A", strokeThickness: 3
        }).setOrigin(0.5);
        this.powerGroup.add([pmBg, this.powerFill, pmLabel]);
        this.powerGroup.setVisible(false);

        // ---- Reaction bar (hidden until a bite) ----
        this.reactionGroup = this.add.container(0, 0).setDepth(60);
        const rbBg = this.add.rectangle(240, BAR_Y, BAR_RIGHT - BAR_LEFT, 30, 0x2B4A63, 0.9).setStrokeStyle(3, 0xffffff);
        this.catchZone = this.add.rectangle(240, BAR_Y, 66, 26, 0x7ED957).setOrigin(0.5);
        this.reactionMarker = this.add.rectangle(BAR_LEFT, BAR_Y, 8, 34, 0xffffff).setOrigin(0.5);
        const rbLabel = this.add.text(240, BAR_Y - 34, "TAP in the green!", {
            fontFamily: "Arial", fontSize: "18px", fontStyle: "bold",
            color: "#ffffff", stroke: "#35648A", strokeThickness: 3
        }).setOrigin(0.5);
        this.reactionGroup.add([rbBg, this.catchZone, this.reactionMarker, rbLabel]);
        this.reactionGroup.setVisible(false);

    }

    setInstruction(text) {
        this.instruction.setText(text);
    }

    updateCombo() {
        if (this.combo > 1) {
            this.comboText.setText(`🔥 Combo x${this.combo}`);
        } else {
            this.comboText.setText("");
        }
    }

    // ---------------------------------------------------------
    // Intro
    // ---------------------------------------------------------

    playIntroAnimation() {

        this.bunny.setVisible(true);

        this.boatContainer.x = 240;
        this.boatContainer.y = 140;
        this.boatContainer.setScale(0.08);

        this.tweens.add({
            targets: this.boatContainer,
            y: BOAT_REST_Y,
            scaleX: 1,
            scaleY: 1,
            duration: 2200,
            ease: "Sine.easeOut",
            onComplete: () => {

                this.startBoatBob();

                this.tweens.add({
                    targets: this.portal,
                    alpha: 0,
                    duration: 500,
                    onComplete: () => this.portal.destroy()
                });

                this.burstSparkles(240, 440, 12);

                this.time.delayedCall(500, () => {
                    this.rod.rod.setVisible(true);
                    this.rod.rod.setScale(0);
                    this.tweens.add({
                        targets: this.rod.rod,
                        scale: 0.16,
                        duration: 400,
                        ease: "Back.easeOut"
                    });
                });

                this.time.delayedCall(900, () => this.startFishing());

            }
        });

    }

    // Gentle bobbing around the resting position
    startBoatBob() {
        this.tweens.add({
            targets: this.boatContainer,
            y: BOAT_REST_Y - 6,
            duration: 1800,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut"
        });
    }

    startFishing() {
        this.state = "idle";
        this.setInstruction("Hold anywhere to charge power,\nrelease to cast!");
        this.updateTimer();
        this.updateLives();
        this.startTimer();
    }

    // ---------------------------------------------------------
    // Timer + lives (day stakes)
    // ---------------------------------------------------------

    startTimer() {

        this.timerEvent = this.time.addEvent({
            delay: 1000,
            loop: true,
            callback: () => {

                if (this.state === "won" || this.state === "failed") {
                    return;
                }

                this.timeLeft -= 1;
                this.updateTimer();

                if (this.timeLeft <= 0) {
                    this.failDay("Out of time!");
                }

            }
        });

    }

    updateTimer() {
        const t = Math.max(0, this.timeLeft);
        this.timerText.setText(`⏱ ${t}`);
        this.timerText.setColor(t <= 10 ? "#FF5A5A" : "#ffffff");
    }

    updateLives() {
        const full = "❤️".repeat(this.lives);
        const empty = "🖤".repeat(Math.max(0, this.maxLives - this.lives));
        this.livesText.setText(full + empty);
    }

    failDay(reason) {

        if (this.state === "won" || this.state === "failed") {
            return;
        }

        this.state = "failed";

        if (this.timerEvent) {
            this.timerEvent.remove();
            this.timerEvent = null;
        }

        AudioManager.fail();
        this.cameras.main.shake(300, 0.008);

        this.clearBiteShadow(false);
        this.tweens.killTweensOf(this.hook);
        this.hook.setVisible(false);
        this.lineGraphics.clear();
        this.reactionGroup.setVisible(false);
        this.powerGroup.setVisible(false);
        this.setInstruction("");

        this.showFailPopup(reason);

    }

    showFailPopup(reason) {

        const panel = this.add.rectangle(240, 400, 360, 220, 0xFFF0F0, 0.98).setDepth(110);
        panel.setStrokeStyle(5, 0xD9534F);

        this.add.text(
            240, 365,
            `😢\n${reason}\n\nTry again?`,
            {
                fontFamily: "Arial",
                fontSize: "28px",
                color: "#4A3A24",
                align: "center"
            }
        ).setOrigin(0.5).setDepth(111);

        const button = this.add.rectangle(240, 490, 200, 55, 0x7ED957).setDepth(111);
        button.setStrokeStyle(3, 0x4A7A2A);

        this.add.text(
            240, 490, "Try Again",
            {
                fontFamily: "Arial",
                fontSize: "24px",
                color: "#ffffff",
                fontStyle: "bold"
            }
        ).setOrigin(0.5).setDepth(112);

        button.setInteractive({ useHandCursor: true });
        button.on("pointerdown", () => {
            // Fresh attempt at the same day's list
            GameData.collectedItems = [];
            this.scene.restart({ retry: true });
        });

    }

    // ---------------------------------------------------------
    // Input
    // ---------------------------------------------------------

    onPointerDown(pointer) {

        // Ignore taps that land on the mute button
        if (this.muteButton) {
            const hits = this.input.hitTestPointer(pointer);
            if (hits.includes(this.muteButton)) {
                return;
            }
        }

        if (this.state === "idle") {
            this.beginCharge();
        } else if (this.state === "minigame") {
            this.lockReaction();
        }

    }

    onPointerUp() {

        if (this.state === "charging") {
            this.releaseCast();
        }

    }

    // ---------------------------------------------------------
    // Casting (power meter)
    // ---------------------------------------------------------

    beginCharge() {
        this.state = "charging";
        this.charge = 0;
        this.chargeDir = 1;
        this.powerGroup.setVisible(true);
        this.setInstruction("Release to cast!");
    }

    releaseCast() {

        this.state = "casting";
        this.powerGroup.setVisible(false);
        this.setInstruction("");

        AudioManager.cast();

        const power = this.charge; // 0..1

        // Zone by power
        if (power < 0.4) {
            this.currentZone = "shallow";
        } else if (power < 0.75) {
            this.currentZone = "mid";
        } else {
            this.currentZone = "deep";
        }

        // Landing point in the water below the boat: more power = farther / deeper
        const targetX = 170 + power * 210;
        const targetY = 630 + power * 110;

        const tip = this.rod.getTipPosition();
        this.hook.setPosition(tip.x, tip.y);
        this.hook.setVisible(true);
        this.hook.setAngle(0);

        this.tweens.add({
            targets: this.hook,
            x: targetX,
            y: targetY,
            duration: 450,
            ease: "Sine.easeOut",
            onComplete: () => {
                this.createSplash(targetX, targetY);
                this.startWaiting();
            }
        });

    }

    startWaiting() {

        this.state = "waiting";
        this.setInstruction("A shadow is circling...");

        const waitTime = Phaser.Math.Between(1400, 3200);

        // A dark shadow swims in toward the bobber (telegraphs the bite)
        const fromLeft = Math.random() < 0.5;
        const startX = fromLeft ? this.hook.x - 230 : this.hook.x + 230;

        this.biteShadow = this.add.ellipse(
            startX,
            this.hook.y + 20,
            38, 16,
            0x1E3A55, 0.3
        );
        this.biteShadow.setDepth(30);

        // Wobble as it swims
        this.tweens.add({
            targets: this.biteShadow,
            scaleY: 1.3,
            duration: 300,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut"
        });

        // Glide toward the bobber, then bite
        this.tweens.add({
            targets: this.biteShadow,
            x: this.hook.x,
            duration: waitTime,
            ease: "Sine.easeIn",
            onComplete: () => this.onBite()
        });

    }

    onBite() {

        if (this.state !== "waiting") {
            return;
        }

        AudioManager.bite();

        // Bobber dips
        this.tweens.killTweensOf(this.hook);
        this.tweens.add({
            targets: this.hook,
            y: this.hook.y + 8,
            angle: 18,
            duration: 110,
            yoyo: true,
            repeat: 3,
            onComplete: () => {
                this.hook.setAngle(0);
                this.startReaction();
            }
        });

    }

    // ---------------------------------------------------------
    // Reaction catch minigame
    // ---------------------------------------------------------

    startReaction() {

        this.state = "minigame";
        this.setInstruction("");

        const zone = ZONES[this.currentZone];

        // Place the green catch zone somewhere on the bar
        this.catchZone.width = zone.catchWidth;
        this.catchZone.setFillStyle(zone.color);
        const half = zone.catchWidth / 2;
        this.zoneCenter = Phaser.Math.Between(BAR_LEFT + half + 10, BAR_RIGHT - half - 10);
        this.catchZone.x = this.zoneCenter;

        this.reactionMarker.x = BAR_LEFT;
        this.markerDir = 1;
        this.markerSpeed = zone.markerSpeed;

        this.reactionGroup.setVisible(true);

        // Auto-miss if the player freezes
        this.reactionTimer = this.time.delayedCall(3200, () => {
            if (this.state === "minigame") {
                this.resolveMiss();
            }
        });

    }

    lockReaction() {

        if (this.reactionTimer) {
            this.reactionTimer.remove();
            this.reactionTimer = null;
        }

        this.reactionGroup.setVisible(false);
        this.state = "resolving";

        const half = this.catchZone.width / 2;
        const inZone = Math.abs(this.reactionMarker.x - this.zoneCenter) <= half;

        if (inZone) {
            this.resolveCatch();
        } else {
            this.resolveMiss();
        }

    }

    resolveMiss() {

        this.reactionGroup.setVisible(false);
        this.state = "resolving";

        this.combo = 0;
        this.updateCombo();

        this.lives -= 1;
        this.updateLives();

        AudioManager.miss();

        this.clearBiteShadow(true);

        this.retractLine(() => {

            if (this.lives <= 0) {
                this.showFloating("Just missed it!", 0xD9534F, () => this.failDay("Out of tries for today!"));
            } else {
                this.showFloating("Just missed it!", 0xD9534F, () => this.readyNextCast());
            }

        });

    }

    clearBiteShadow(dartAway) {

        if (!this.biteShadow) {
            return;
        }

        const shadow = this.biteShadow;
        this.biteShadow = null;
        this.tweens.killTweensOf(shadow);

        if (dartAway) {
            // Startled fish flees
            this.tweens.add({
                targets: shadow,
                x: shadow.x + Phaser.Math.Between(120, 200),
                y: shadow.y + 20,
                alpha: 0,
                duration: 450,
                ease: "Sine.easeIn",
                onComplete: () => shadow.destroy()
            });
        } else {
            this.tweens.add({
                targets: shadow,
                alpha: 0,
                duration: 250,
                onComplete: () => shadow.destroy()
            });
        }

    }

    resolveCatch() {

        const zone = ZONES[this.currentZone];

        this.clearBiteShadow(false);

        // A good catch always lands one of the items still on today's list
        const remaining = GameData.shoppingList.filter(
            (i) => !GameData.collectedItems.includes(i.name)
        );

        if (remaining.length === 0) {
            this.retractLine(() => this.checkWinCondition());
            return;
        }

        const item = Phaser.Utils.Array.GetRandom(remaining);

        this.retractLine(() => {

            GameData.collectedItems.push(item.name);
            GameData.totalCaught += 1;

            this.combo += 1;
            if (this.combo > GameData.bestCombo) {
                GameData.bestCombo = this.combo;
            }
            this.updateCombo();

            // Immediate skill reward: zone bonus + combo bonus
            const bonus = zone.bonus + (this.combo - 1) * 2;
            GameData.coins += bonus;
            GameData.save();

            AudioManager.success();
            this.cameras.main.shake(160, 0.004);

            this.shoppingUI.updateList();
            this.showCoinBurst(bonus);

            this.shoppingUI.showCatchPopup(item, true, "", () => this.checkWinCondition());

        });

    }

    readyNextCast() {

        if (this.state === "won") {
            return;
        }

        this.hook.setVisible(false);
        this.hook.setAngle(0);
        this.state = "idle";
        this.setInstruction("Hold anywhere to charge power,\nrelease to cast!");

    }

    checkWinCondition() {

        if (GameData.collectedItems.length === GameData.shoppingList.length) {

            this.state = "won";

            if (this.timerEvent) {
                this.timerEvent.remove();
                this.timerEvent = null;
            }

            // Speed bonus: leftover seconds become coins
            const timeBonus = Math.max(0, this.timeLeft);
            if (timeBonus > 0) {
                GameData.coins += timeBonus;
                this.showCoinBurst(timeBonus);
            }

            GameData.save();

            AudioManager.win();
            this.cameras.main.flash(300, 255, 255, 200);

            this.shoppingUI.showWinPopup(() => {
                this.cameras.main.fadeOut(400, 0, 0, 0);
                this.time.delayedCall(400, () => this.scene.start("CloudMarketScene"));
            });

        } else {

            this.readyNextCast();

        }

    }

    // ---------------------------------------------------------
    // Line + effects
    // ---------------------------------------------------------

    retractLine(onDone) {

        const tip = this.rod.getTipPosition();

        this.tweens.killTweensOf(this.hook);
        this.tweens.add({
            targets: this.hook,
            x: tip.x,
            y: tip.y,
            duration: 350,
            ease: "Sine.easeIn",
            onComplete: () => {
                this.lineGraphics.clear();
                if (onDone) {
                    onDone();
                }
            }
        });

    }

    drawLine() {

        const tip = this.rod.getTipPosition();
        this.lineGraphics.clear();
        this.lineGraphics.lineStyle(1, 0xE8E2D6, 0.9);
        this.lineGraphics.beginPath();
        this.lineGraphics.moveTo(tip.x, tip.y);
        this.lineGraphics.lineTo(this.hook.x, this.hook.y);
        this.lineGraphics.strokePath();

    }

    createSplash(x, y) {

        AudioManager.splash();

        const splash = this.add.circle(x, y, 8, 0xFFFFFF).setAlpha(0.8);
        this.tweens.add({
            targets: splash,
            scale: 3,
            alpha: 0,
            duration: 350,
            onComplete: () => splash.destroy()
        });

        this.burstSparkles(x, y, 6);

    }

    burstSparkles(x, y, count) {

        for (let i = 0; i < count; i++) {
            const sparkle = this.add.circle(x, y, Phaser.Math.Between(2, 4), 0xFFF799);
            this.tweens.add({
                targets: sparkle,
                x: x + Phaser.Math.Between(-30, 30),
                y: y + Phaser.Math.Between(-30, 30),
                alpha: 0,
                duration: 600,
                delay: i * 30,
                onComplete: () => sparkle.destroy()
            });
        }

    }

    showCoinBurst(amount) {

        AudioManager.coin();

        const t = this.add.text(240, 300, `+${amount} 🪙`, {
            fontFamily: "Arial",
            fontSize: "30px",
            fontStyle: "bold",
            color: "#FFD700",
            stroke: "#5A3E1B",
            strokeThickness: 5
        }).setOrigin(0.5).setDepth(70);

        this.tweens.add({
            targets: t,
            y: 250,
            alpha: 0,
            duration: 1100,
            ease: "Sine.easeOut",
            onComplete: () => t.destroy()
        });

    }

    showFloating(message, color, onDone) {

        const t = this.add.text(240, 320, message, {
            fontFamily: "Arial",
            fontSize: "26px",
            fontStyle: "bold",
            color: "#ffffff",
            backgroundColor: "#00000055",
            padding: { left: 14, right: 14, top: 8, bottom: 8 }
        }).setOrigin(0.5).setDepth(70);

        this.time.delayedCall(1100, () => {
            t.destroy();
            if (onDone) {
                onDone();
            }
        });

    }

    // ---------------------------------------------------------
    // Update loop drives the two meters + the line
    // ---------------------------------------------------------

    update(time, delta) {

        const dt = delta / 1000;

        if (this.state === "charging") {

            // Oscillate 0 -> 1 -> 0
            this.charge += this.chargeDir * dt * 1.4;
            if (this.charge >= 1) {
                this.charge = 1;
                this.chargeDir = -1;
            } else if (this.charge <= 0) {
                this.charge = 0;
                this.chargeDir = 1;
            }

            this.powerFill.width = 300 * this.charge;

            // Green -> amber -> pink as power grows
            let c = 0x7ED957;
            if (this.charge >= 0.75) {
                c = 0xFF7BAC;
            } else if (this.charge >= 0.4) {
                c = 0xFFC93C;
            }
            this.powerFill.setFillStyle(c);

        }

        if (this.state === "minigame") {

            this.reactionMarker.x += this.markerDir * this.markerSpeed * dt;
            if (this.reactionMarker.x >= BAR_RIGHT) {
                this.reactionMarker.x = BAR_RIGHT;
                this.markerDir = -1;
            } else if (this.reactionMarker.x <= BAR_LEFT) {
                this.reactionMarker.x = BAR_LEFT;
                this.markerDir = 1;
            }

        }

        // Keep the line attached whenever the bobber is out
        if (this.hook && this.hook.visible) {
            this.drawLine();
        }

    }

}
