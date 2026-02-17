import sharp from "sharp";

const svg = `<svg width="500" height="80" xmlns="http://www.w3.org/2000/svg">
  <text x="250" y="55" font-family="Arial, sans-serif" font-size="42" font-weight="bold"
    fill="white" text-anchor="middle" letter-spacing="6">BAAN MAE VILLA</text>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile("public/watermark.png");
console.log("watermark.png created");
