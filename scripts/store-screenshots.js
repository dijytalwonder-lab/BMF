// Composes 5 Play Store screenshots (1080x1920, 9:16) from the game art.
// One set satisfies phone + 7in + 10in tablet (min side 1080).
// Note: resvg renders emoji as flat glyphs, so overlays use drawn SVG shapes.
import sharp from "sharp";
import { mkdirSync } from "fs";

const W = 1080, H = 1920;
const OUT = "store/screenshots";
mkdirSync(OUT, { recursive: true });

const P = "public/images/";
const load = (f, resize) => resize ? sharp(P + f).resize(resize).png().toBuffer() : sharp(P + f).png().toBuffer();

async function centered(buf, cx, cy) {
    const m = await sharp(buf).metadata();
    return { input: buf, left: Math.round(cx - m.width / 2), top: Math.round(cy - m.height / 2) };
}
const cover = (f) => sharp(P + f).resize(W, H, { fit: "cover", position: "north" }).toBuffer();
const svg = (inner) => Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`);

function caption(text) {
    return `<rect x="60" y="60" width="960" height="150" rx="44" fill="#FFFDF7" fill-opacity="0.96" stroke="#8B6B3F" stroke-width="6"/>
        <text x="540" y="158" font-family="Arial, sans-serif" font-size="50" font-weight="bold" fill="#4A3A24" text-anchor="middle">${text}</text>`;
}
function heart(cx, cy, s = 2) {
    return `<path transform="translate(${cx - 12 * s},${cy - 12 * s}) scale(${s})" d="M12 21 C12 21 3 13.5 3 8 C3 5 5.5 3 8 3 C10 3 12 5 12 6.5 C12 5 14 3 16 3 C18.5 3 21 5 21 8 C21 13.5 12 21 12 21 Z" fill="#FF5A7A" stroke="#C9314F" stroke-width="1"/>`;
}
function checkbox(x, y, checked) {
    let s = `<rect x="${x}" y="${y}" width="30" height="30" rx="6" fill="#ffffff" stroke="#8B6B3F" stroke-width="3.5"/>`;
    if (checked) s += `<path d="M${x + 6} ${y + 16} l7 7 l12 -16" fill="none" stroke="#3A9D23" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`;
    return s;
}

async function save(name, base, layers) {
    await sharp(base).composite(layers).png().toFile(`${OUT}/${name}.png`);
    console.log("wrote", name);
}

// 1 — Title / Home
async function home() {
    const base = await cover("backgrounds/home_background.png");
    const house = await load("house/bunny_house.png", { width: 820 });
    const bunny = await load("bunny/bunny_idle.png", { height: 640 });
    const overlay = svg(`
        <text x="540" y="230" font-family="Arial, sans-serif" font-size="76" font-weight="bold" fill="#FFFFFF" stroke="#4A4A4A" stroke-width="10" paint-order="stroke" text-anchor="middle">Bunny's</text>
        <text x="540" y="320" font-family="Arial, sans-serif" font-size="76" font-weight="bold" fill="#FFFFFF" stroke="#4A4A4A" stroke-width="10" paint-order="stroke" text-anchor="middle">Magical Fishing</text>
        <rect x="330" y="1690" width="420" height="120" rx="30" fill="#7ED957" stroke="#4A7A2A" stroke-width="6"/>
        <text x="540" y="1770" font-family="Arial, sans-serif" font-size="56" font-weight="bold" fill="#FFFFFF" text-anchor="middle">PLAY</text>`);
    await save("1-home", base, [
        await centered(house, 540, 1120),
        await centered(bunny, 540, 1470),
        { input: overlay, left: 0, top: 0 }
    ]);
}

// 2 — Fishing (hero gameplay shot with HUD)
async function fishing() {
    const base = await sharp(svg(`
        <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#D6F3FF"/><stop offset="60%" stop-color="#BEEBFF"/></linearGradient></defs>
        <rect width="${W}" height="${H}" fill="url(#sky)"/>`)).png().toBuffer();
    const water = await sharp(P + "fishing/water.png").resize(W, 900, { fit: "fill" }).png().toBuffer();
    const clouds1 = await load("fishing/clouds.png", { width: 520 });
    const clouds2 = await load("fishing/clouds.png", { width: 360 });
    const boat = await load("fishing/boat.png", { width: 660 });
    const bunny = await load("bunny/bunny_idle.png", { height: 360 });
    const rod = await sharp(P + "fishing/fishing_rod.png").resize({ height: 380 }).png().toBuffer();
    const bobber = await load("ui/magical_bobber.png", { width: 90 });

    const hud = svg(`
        ${heart(105, 120)} ${heart(165, 120)} ${heart(225, 120)}
        <rect x="330" y="70" width="420" height="220" rx="26" fill="#FFFDF5" stroke="#8B6B3F" stroke-width="5"/>
        <text x="540" y="120" font-family="Arial" font-size="32" font-weight="bold" fill="#5A3E1B" text-anchor="middle">Shopping List</text>
        ${checkbox(360, 145, false)}<text x="405" y="169" font-family="Arial" font-size="30" fill="#333">Apple</text>
        ${checkbox(360, 190, true)}<text x="405" y="214" font-family="Arial" font-size="30" fill="#3A9D23">Carrot</text>
        ${checkbox(360, 235, false)}<text x="405" y="259" font-family="Arial" font-size="30" fill="#333">Juice</text>
        <circle cx="900" cy="128" r="22" fill="none" stroke="#35648A" stroke-width="5"/>
        <line x1="900" y1="128" x2="900" y2="114" stroke="#35648A" stroke-width="4" stroke-linecap="round"/>
        <line x1="900" y1="128" x2="910" y2="132" stroke="#35648A" stroke-width="4" stroke-linecap="round"/>
        <text x="935" y="145" font-family="Arial" font-size="46" font-weight="bold" fill="#35648A">42</text>
        <line x1="700" y1="1120" x2="620" y2="1500" stroke="#E8E2D6" stroke-width="3"/>
        <rect x="150" y="1740" width="780" height="130" rx="40" fill="#FFFDF7" fill-opacity="0.96" stroke="#8B6B3F" stroke-width="5"/>
        <text x="540" y="1822" font-family="Arial" font-size="46" font-weight="bold" fill="#4A3A24" text-anchor="middle">Cast, wait for the bite, then reel!</text>`);

    await save("2-fishing", base, [
        { input: water, left: 0, top: 1020 },
        await centered(clouds1, 300, 620),
        await centered(clouds2, 820, 720),
        await centered(rod, 720, 1230),
        await centered(boat, 540, 1420),
        await centered(bunny, 500, 1230),
        await centered(bobber, 620, 1520),
        { input: hud, left: 0, top: 0 }
    ]);
}

// 3 — Shopping list
async function shopping() {
    const base = await cover("backgrounds/home_background.png");
    const parch = await load("ui/shopping_parchment.png", { width: 860 });
    const bunny = await load("bunny/bunny_idle.png", { height: 520 });
    const dot = (y, c) => `<circle cx="415" cy="${y - 14}" r="16" fill="${c}"/>`;
    const list = svg(`
        ${caption("Catch today's shopping list!")}
        <text x="560" y="720" font-family="Arial" font-size="48" font-weight="bold" fill="#5A3E1B" text-anchor="middle">Shopping List</text>
        ${dot(848, "#E8506E")}<text x="450" y="862" font-family="Arial" font-size="48" fill="#333">Apple</text>
        ${dot(948, "#F0912B")}<text x="450" y="962" font-family="Arial" font-size="48" fill="#333">Carrot</text>
        ${dot(1048, "#5FBF4F")}<text x="450" y="1062" font-family="Arial" font-size="48" fill="#333">Juice</text>`);
    await save("3-shopping", base, [
        await centered(parch, 560, 830),
        await centered(bunny, 300, 1520),
        { input: list, left: 0, top: 0 }
    ]);
}

// 4 — Decorate home (interior)
async function decorate() {
    const base = await cover("backgrounds/home_background.png");
    const house = await load("house/house_inside.png", { width: 1040 });
    const bunny = await load("bunny/bunny_idle.png", { height: 360 });
    const cap = svg(caption("Decorate your cozy bunny home!"));
    await save("4-decorate", base, [
        await centered(house, 540, 980),
        await centered(bunny, 540, 1230),
        { input: cap, left: 0, top: 0 }
    ]);
}

// 5 — Cloud market
async function market() {
    const base = await cover("backgrounds/cloud_market_background.png");
    const stall = await load("market/cloud_stall.png", { width: 860 });
    const fairy = await load("fairy/fairy_idle.png", { height: 340 });
    const bunny = await load("bunny/bunny_idle.png", { height: 460 });
    const cap = svg(caption("Sell your catch at the Cloud Market!"));
    await save("5-market", base, [
        await centered(stall, 540, 1080),
        await centered(fairy, 280, 760),
        await centered(bunny, 770, 1240),
        { input: cap, left: 0, top: 0 }
    ]);
}

await home();
await fishing();
await shopping();
await decorate();
await market();
console.log("done");
