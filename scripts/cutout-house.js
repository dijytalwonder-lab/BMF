// Make the flat blue-grey backdrop of house_inside.png transparent so the
// interior can float on top of the outdoor home_background.
import sharp from "sharp";

const SRC = "public/images/house/house_inside_src.png"; // original backup
const OUT = "public/images/house/house_inside.png";
const TOLERANCE = 60; // colour distance from the sampled backdrop colour

async function run() {
    const img = sharp(SRC).ensureAlpha();
    const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
    const { width, height, channels } = info;

    // Sample the top-left corner as the backdrop colour
    const bg = { r: data[0], g: data[1], b: data[2] };
    console.log("backdrop colour:", bg);

    for (let i = 0; i < data.length; i += channels) {
        const dr = data[i] - bg.r;
        const dg = data[i + 1] - bg.g;
        const db = data[i + 2] - bg.b;
        const dist = Math.sqrt(dr * dr + dg * dg + db * db);
        if (dist < TOLERANCE) {
            data[i + 3] = 0; // transparent
        }
    }

    await sharp(data, { raw: { width, height, channels } }).png().toFile(OUT);
    console.log("wrote", OUT, `(${width}x${height})`);
}

run().catch((e) => { console.error(e); process.exit(1); });
