// Compress all game PNGs in place (palette + dithering) to shrink the APK.
// Keeps original dimensions, so art stays sharp on high-DPI phones.
// Run: node scripts/optimize-images.js
import sharp from "sharp";
import { readdirSync, statSync, writeFileSync } from "fs";
import { join, extname } from "path";

const ROOT = "public/images";

function walk(dir) {
    let files = [];
    for (const name of readdirSync(dir)) {
        const p = join(dir, name);
        if (statSync(p).isDirectory()) {
            files = files.concat(walk(p));
        } else if (extname(p).toLowerCase() === ".png") {
            files.push(p);
        }
    }
    return files;
}

async function run() {
    const files = walk(ROOT);
    let before = 0, after = 0;

    for (const file of files) {
        const origSize = statSync(file).size;
        const buf = await sharp(file)
            .png({ palette: true, quality: 88, effort: 10, compressionLevel: 9 })
            .toBuffer();

        // Only replace if it actually got smaller
        if (buf.length < origSize) {
            writeFileSync(file, buf);
            after += buf.length;
        } else {
            after += origSize;
        }
        before += origSize;
    }

    console.log(
        `Optimized ${files.length} images: ` +
        `${(before / 1048576).toFixed(1)}MB -> ${(after / 1048576).toFixed(1)}MB ` +
        `(${(100 * (1 - after / before)).toFixed(0)}% smaller)`
    );
}

run().catch((e) => { console.error(e); process.exit(1); });
