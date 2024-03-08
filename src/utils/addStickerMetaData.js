
const webp = require("node-webpmux");

async function addStickerMetaData(mediaPath, metadata) {
  const file = mediaPath;

  if (metadata.packname || metadata.author) {
    const img = new webp.Image();
    
    const json = {
      "sticker-pack-id": `Inky Bot`,
      "sticker-pack-name": metadata.packname,
      "sticker-pack-publisher": metadata.author,
      emojis: metadata.categories ? metadata.categories : [""],
    };

    const exifAttr = Buffer.from([
      0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57,
      0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00,
    ]);

    const jsonBuff = Buffer.from(JSON.stringify(json), "utf-8");
    const exif = Buffer.concat([exifAttr, jsonBuff]);
    exif.writeUIntLE(jsonBuff.length, 14, 4);

    await img.load(mediaPath);

    img.exif = exif;
    await img.save(file);

    return file;
  }
}

module.exports = {addStickerMetaData};