// Synthesised audio - no asset files needed, works in a WebView / Capacitor.
// All sounds are generated with the Web Audio API on the fly.

class AudioManager {

    constructor() {
        this.ctx = null;
        this.muted = false;
        this.musicOn = false;
        this.musicTimer = null;

        try {
            this.muted = window.localStorage.getItem("bunnyMuted") === "1";
        } catch (e) {
            // ignore
        }
    }

    ensure() {
        if (!this.ctx) {
            const AC = window.AudioContext || window.webkitAudioContext;
            if (AC) {
                this.ctx = new AC();
            }
        }
        if (this.ctx && this.ctx.state === "suspended") {
            this.ctx.resume();
        }
        return this.ctx;
    }

    // A single enveloped note
    tone(freq, dur, type = "sine", vol = 0.2, whenOffset = 0) {
        if (this.muted) {
            return;
        }
        const ctx = this.ensure();
        if (!ctx) {
            return;
        }
        const t0 = ctx.currentTime + whenOffset;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, t0);
        gain.gain.setValueAtTime(0.0001, t0);
        gain.gain.linearRampToValueAtTime(vol, t0 + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t0);
        osc.stop(t0 + dur + 0.02);
    }

    // A pitch glide (swoosh / splash)
    sweep(f1, f2, dur, type = "sine", vol = 0.15) {
        if (this.muted) {
            return;
        }
        const ctx = this.ensure();
        if (!ctx) {
            return;
        }
        const t0 = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(f1, t0);
        osc.frequency.exponentialRampToValueAtTime(Math.max(1, f2), t0 + dur);
        gain.gain.setValueAtTime(vol, t0);
        gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t0);
        osc.stop(t0 + dur + 0.02);
    }

    // ---- Named effects ----
    click()  { this.tone(520, 0.06, "square", 0.10); }
    cast()   { this.sweep(620, 180, 0.30, "triangle", 0.12); }
    splash() { this.tone(320, 0.12, "sine", 0.15); this.tone(500, 0.10, "sine", 0.10, 0.03); }
    bite()   { this.tone(880, 0.08, "square", 0.12); this.tone(880, 0.08, "square", 0.12, 0.13); }
    coin()   { this.tone(988, 0.08, "square", 0.12); this.tone(1319, 0.12, "square", 0.12, 0.07); }
    miss()   { this.sweep(300, 110, 0.35, "sawtooth", 0.10); }

    success() {
        this.tone(523, 0.12, "triangle", 0.16);
        this.tone(659, 0.12, "triangle", 0.16, 0.10);
        this.tone(784, 0.18, "triangle", 0.16, 0.20);
    }

    win() {
        [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.22, "triangle", 0.18, i * 0.12));
    }

    fail() {
        [440, 392, 330, 262].forEach((f, i) => this.tone(f, 0.24, "sine", 0.16, i * 0.14));
    }

    // ---- Gentle ambient background music ----
    startMusic() {
        if (this.musicOn) {
            return;
        }
        this.musicOn = true;

        const scale = [523, 587, 659, 784, 880]; // C D E G A pentatonic
        let beat = 0;

        const step = () => {
            if (!this.musicOn) {
                return;
            }
            if (!this.muted) {
                const f = scale[Math.floor(Math.random() * scale.length)];
                this.tone(f, 0.5, "sine", 0.045);
                if (beat % 4 === 0) {
                    this.tone(f / 2, 0.6, "sine", 0.035); // soft bass
                }
            }
            beat += 1;
            this.musicTimer = setTimeout(step, 520);
        };

        step();
    }

    stopMusic() {
        this.musicOn = false;
        if (this.musicTimer) {
            clearTimeout(this.musicTimer);
            this.musicTimer = null;
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        try {
            window.localStorage.setItem("bunnyMuted", this.muted ? "1" : "0");
        } catch (e) {
            // ignore
        }
        return this.muted;
    }

    // Adds a 🔊/🔇 toggle to a scene; returns the button object
    addMuteButton(scene, x = 452, y = 28) {
        const btn = scene.add.text(
            x, y,
            this.muted ? "🔇" : "🔊",
            { fontSize: "26px" }
        ).setOrigin(0.5).setDepth(200).setScrollFactor(0);

        btn.setInteractive({ useHandCursor: true });
        btn.on("pointerdown", () => {
            const m = this.toggleMute();
            btn.setText(m ? "🔇" : "🔊");
        });

        return btn;
    }

}

export default new AudioManager();
