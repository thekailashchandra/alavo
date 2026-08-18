const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const dir = path.join(__dirname, "..", "public");
const anySvg = fs.readFileSync(path.join(dir, "icon.svg"));
const maskableSvg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#5B6B9A"/>
  <g transform="translate(76.8 76.8) scale(0.7)">
    <path d="M160 300c40-100 152-100 192 0" stroke="#ffffff" stroke-width="36" fill="none" stroke-linecap="round"/>
    <circle cx="256" cy="188" r="28" fill="#ffffff"/>
  </g>
</svg>`);

async function main() {
  await sharp(anySvg).resize(192, 192).png().toFile(path.join(dir, "icon-192.png"));
  await sharp(anySvg).resize(512, 512).png().toFile(path.join(dir, "icon-512.png"));
  await sharp(anySvg).resize(180, 180).png().toFile(path.join(dir, "apple-touch-icon.png"));
  await sharp(anySvg).resize(32, 32).png().toFile(path.join(dir, "favicon-32.png"));
  await sharp(maskableSvg).resize(192, 192).png().toFile(path.join(dir, "icon-192-maskable.png"));
  await sharp(maskableSvg).resize(512, 512).png().toFile(path.join(dir, "icon-512-maskable.png"));
  console.log("PWA icons written to public/");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
