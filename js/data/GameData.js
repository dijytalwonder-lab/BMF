const SAVE_KEY = "bunnyFishingSave";

// Fields that should survive across sessions
const PERSISTENT_FIELDS = [
    "day",
    "coins",
    "ownedDecorations",
    "decorPositions",
    "bestCombo",
    "totalCaught"
];

const GameData = {

    // ---- Persistent progress (saved) ----
    day: 1,
    coins: 0,
    ownedDecorations: [],
    decorPositions: {},
    bestCombo: 0,
    totalCaught: 0,

    // ---- Per-run state (not saved) ----
    bunnyAtHome: false,
    shoppingList: [],
    collectedItems: [],

    // Difficulty grows with the day: more items, less time, still 3 lives.
    // Capped at 5 because there are only 6 item types.
    dayConfig() {

        const items = Math.min(3 + Math.floor((this.day - 1) / 2), 5);
        const time = items * 18 + 6;
        const lives = 3;

        return { items, time, lives };

    },

    // Load saved progress from localStorage (call once at startup)
    load() {

        try {

            const raw = window.localStorage.getItem(SAVE_KEY);

            if (!raw) {
                return;
            }

            const saved = JSON.parse(raw);

            PERSISTENT_FIELDS.forEach((field) => {

                if (saved[field] !== undefined) {
                    this[field] = saved[field];
                }

            });

        } catch (e) {

            // Corrupt or unavailable storage: start fresh, don't crash
            console.warn("Could not load save:", e);

        }

    },

    // Persist current progress to localStorage
    save() {

        try {

            const payload = {};

            PERSISTENT_FIELDS.forEach((field) => {
                payload[field] = this[field];
            });

            window.localStorage.setItem(
                SAVE_KEY,
                JSON.stringify(payload)
            );

        } catch (e) {

            console.warn("Could not save progress:", e);

        }

    },

    // Wipe save (handy for testing / a future "reset" button)
    reset() {

        try {
            window.localStorage.removeItem(SAVE_KEY);
        } catch (e) {
            // ignore
        }

        this.day = 1;
        this.coins = 0;
        this.ownedDecorations = [];
        this.decorPositions = {};
        this.bestCombo = 0;
        this.totalCaught = 0;
        this.bunnyAtHome = false;
        this.shoppingList = [];
        this.collectedItems = [];

    }

};

export default GameData;
