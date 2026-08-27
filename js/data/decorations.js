// Single source of truth for shop decorations.
// `place` is where the emoji sits in the Home scene when owned.
const DECORATIONS = [

    {
        id: "flowerPot",
        name: "Flower Pot",
        emoji: "🌷",
        cost: 15,
        place: { x: 85, y: 560, size: "42px" }
    },

    {
        id: "chair",
        name: "Chair",
        emoji: "🪑",
        cost: 25,
        place: { x: 250, y: 610, size: "42px" }
    },

    {
        id: "window",
        name: "Window",
        emoji: "🪟",
        cost: 40,
        place: { x: 140, y: 545, size: "42px" }
    },

    {
        id: "flowerGarden",
        name: "Flower Garden",
        emoji: "🌼",
        cost: 60,
        place: { x: 185, y: 690, size: "46px" }
    },

    {
        id: "lantern",
        name: "Fairy Lantern",
        emoji: "🏮",
        cost: 90,
        place: { x: 320, y: 545, size: "40px" }
    },

    {
        id: "fountain",
        name: "Fountain",
        emoji: "⛲",
        cost: 140,
        place: { x: 360, y: 650, size: "48px" }
    }

];

export default DECORATIONS;
