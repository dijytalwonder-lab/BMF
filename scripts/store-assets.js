// Generates Play Store listing graphics into store/.
//   - app-icon-512.png        (512x512)
//   - feature-graphic.png     (1024x500)
import sharp from "sharp";
import { mkdirSync } from "fs";

const BUNNY = "public/images/bunny/bunny_idle.png";
const HOME = "public/images/backgrounds/home_background.png";
const OUT = "store";
mkdirSync(OUT, { recursive: true });

async function appIcon() {
    await sharp("resources/icon-only.png")
        .resize(512, 512)
        .png()
        .toFile(`${OUT}/app-icon-512.png`);
    console.log("wrote app-icon-512.png");
}

async function featureGraphic() {
    const W = 1024, H = 500;

    // Rich background from the game's home scene (cover-cropped to the banner)
    const base = await sharp(HOME)
        .resize(W, H, { fit: "cover", position: "north" })
        .modulate({ brightness: 1.03 })
        .toBuffer();

    // Bunny on the right
    const bunny = await sharp(BUNNY).resize({ height: 470 }).png().toBuffer();
    const bunnyMeta = await sharp(bunny).metadata();

    // Left panel + title + tagline
    const overlay = Buffer.from(
        `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="fade" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stop-color="#FFFDF5" stop-opacity="0.92"/>
                    <stop offset="60%" stop-color="#FFFDF5" stop-opacity="0.80"/>
                    <stop offset="100%" stop-color="#FFFDF5" stop-opacity="0"/>
                </linearGradient>
            </defs>
            <rect x="0" y="0" width="640" height="${H}" fill="url(#fade)"/>
            <text x="60" y="205" font-family="Arial, sans-serif" font-size="74" font-weight="bold" fill="#4A3A24">Bunny's</text>
            <text x="60" y="285" font-family="Arial, sans-serif" font-size="74" font-weight="bold" fill="#4A3A24">Magical Fishing</text>
            <text x="62" y="350" font-family="Arial, sans-serif" font-size="32" fill="#6b5c46">A cozy fishing &amp; decorating adventure</text>
        </svg>`
    );

    await sharp(base)
        .composite([
            { input: bunny, left: W - bunnyMeta.width - 40, top: H - bunnyMeta.height + 10 },
            { input: overlay, left: 0, top: 0 }
        ])
        .png()
        .toFile(`${OUT}/feature-graphic.png`);

    console.log("wrote feature-graphic.png (1024x500)");
}

await appIcon();
await featureGraphic();
