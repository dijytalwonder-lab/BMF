// Single source of truth for shop decorations.
// `place` is where the emoji sits in the Home scene when owned.
const DECORATIONS = [

    {
        id: "flowerPot",
        name: "Flower Pot",
        emoji: "🌷",
        cost: 15,
        place: { x: 120, y: 575, size: "40px" }
    },

    {
        id: "chair",
        name: "Chair",
        emoji: "🪑",
        cost: 25,
        place: { x: 350, y: 560, size: "44px" }
    },

    {
        id: "window",
        name: "Window",
        emoji: "🪟",
        cost: 40,
        place: { x: 115, y: 475, size: "38px" }
    },

    {
        id: "flowerGarden",
        name: "Flower Garden",
        emoji: "🌼",
        cost: 60,
        place: { x: 190, y: 615, size: "44px" }
    },

    {
        id: "lantern",
        name: "Fairy Lantern",
        emoji: "🏮",
        cost: 90,
        place: { x: 365, y: 475, size: "38px" }
    },

    {
        id: "fountain",
        name: "Fountain",
        emoji: "⛲",
        cost: 140,
        place: { x: 295, y: 615, size: "46px" }
    }

];

export default DECORATIONS;
