// Generates app-icon and splash source images in resources/ from the game art.
// Run: node scripts/build-assets.js  (then: npx @capacitor/assets generate --android)
import sharp from "sharp";
import { mkdirSync } from "fs";

const BUNNY = "public/images/bunny/bunny_idle.png";
const OUT = "resources";
mkdirSync(OUT, { recursive: true });

// Soft pastel radial gradient (matches the game's sunrise sky)
const gradient = (size) => Buffer.from(
    `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <radialGradient id="g" cx="50%" cy="42%" r="78%">
                <stop offset="0%" stop-color="#FFF4D9"/>
                <stop offset="55%" stop-color="#E4F5FF"/>
                <stop offset="100%" stop-color="#BEEBFF"/>
            </radialGradient>
        </defs>
        <rect width="${size}" height="${size}" fill="url(#g)"/>
    </svg>`
);

// Center an already-resized image on a transparent square canvas
async function centered(buf, size) {
    const meta = await sharp(buf).metadata();
    return sharp({
        create: { width: size, height: size, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } }
    })
        .composite([{ input: buf, left: Math.round((size - meta.width) / 2), top: Math.round((size - meta.height) / 2) }])
        .png()
        .toBuffer();
}

async function run() {

    // ---- ICON (1024) ----
    const bgIcon = await sharp(gradient(1024)).png().toBuffer();

    // Foreground bunny sits inside the adaptive-icon safe zone (~62%)
    const fgBunny = await sharp(BUNNY).resize({ height: 600 }).png().toBuffer();
    const iconForeground = await centered(fgBunny, 1024);

    await sharp(bgIcon).png().toFile(`${OUT}/icon-background.png`);
    await sharp(iconForeground).png().toFile(`${OUT}/icon-foreground.png`);

    // Legacy square icon = background + a slightly larger bunny
    const legacyBunny = await sharp(BUNNY).resize({ height: 720 }).png().toBuffer();
    const legacyFg = await centered(legacyBunny, 1024);
    await sharp(bgIcon).composite([{ input: legacyFg }]).png().toFile(`${OUT}/icon-only.png`);
    await sharp(bgIcon).composite([{ input: legacyFg }]).png().toFile(`${OUT}/icon.png`);

    // ---- SPLASH (2732) ----
    const bgSplash = await sharp(gradient(2732)).png().toBuffer();
    const splashBunny = await sharp(BUNNY).resize({ height: 1150 }).png().toBuffer();
    const splashBunnyMeta = await sharp(splashBunny).metadata();

    const title = Buffer.from(
        `<svg width="2732" height="2732" xmlns="http://www.w3.org/2000/svg">
            <text x="1366" y="2080" font-family="Arial, Helvetica, sans-serif" font-size="150"
                  font-weight="bold" fill="#5A3E1B" text-anchor="middle">Bunny's Magical Fishing</text>
        </svg>`
    );

    const splash = await sharp(bgSplash)
        .composite([
            { input: splashBunny, left: Math.round((2732 - splashBunnyMeta.width) / 2), top: 720 },
            { input: title, left: 0, top: 0 }
        ])
        .png()
        .toBuffer();

    await sharp(splash).png().toFile(`${OUT}/splash.png`);
    await sharp(splash).png().toFile(`${OUT}/splash-dark.png`);

    console.log("Wrote icon + splash sources to", OUT + "/");
}

run().catch((e) => { console.error(e); process.exit(1); });
