
const {
    downloadContentFromMessage
} = require('@whiskeysockets/baileys');

const pino = require('pino');
const { promisify } = require("util");
const fs = require('fs');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');

const { configBot } = require('../config/config')
ffmpeg.setFfmpegPath(ffmpegPath);
const execAsync = promisify(require("child_process").exec);

async function createSticker(messageReceived, messageType) {

    const mediaQuoted = messageReceived.message.extendedTextMessage?.contextInfo?.quotedMessage;
    let mediaKey = null;

    if (mediaQuoted) {
        mediaKey = mediaQuoted.imageMessage || mediaQuoted.videoMessage || mediaQuoted.stickerMessage
    } else {
        mediaKey = messageReceived.message[messageType];
    }

    const getFileBufferFromWhatsapp = async (mediaKey, mediaType) => {
        const stream = await downloadContentFromMessage(mediaKey, mediaType);
        const chunks = [];

        for await (const chunk of stream) {
            chunks.push(chunk);
        }
        
        return Buffer.concat(chunks);

    };


    mediaType = "seconds" in mediaKey ? "video" : "image";

    //console.log(mediaType)

    if (mediaType == "video" && mediaKey.seconds > 10) {
        return 'videolarge'
    }

    if (mediaType == "video") {

        const randomId = `${Math.random().toString(36).substring(2, 10)}`;
        const filePathIn = `./src/temp/file_${randomId}.mp4`;
        const filePathOut = `./src/temp/file_${randomId}.webp`;

        const buffer = await getFileBufferFromWhatsapp(mediaKey, mediaType);

        fs.writeFileSync(filePathIn, buffer);

        const createSticker = () => {

            return new Promise((resolve, reject) => {
                ffmpeg(filePathIn)
                    .format("webp")
                    .size("200x200")
                    .noAudio()
                    .fps(10)
                    .on("error", (err) => reject(err))
                    .on("end", () => resolve(filePathOut))
                    .save(filePathOut)
            })

        }
        try {

            await createSticker();

            return filePathOut
        } catch {
            return null
        }
    }

    if (mediaType == "image") {
        const randomId = `${Math.random().toString(36).substring(2, 10)}`;
        const filePathIn = `./src/temp/file_${randomId}.png`;
        const filePathOut = `./src/temp/file_${randomId}.webp`;

        const buffer = await getFileBufferFromWhatsapp(mediaKey, mediaType);

        fs.writeFileSync(filePathIn, buffer);

        const createSticker = () => {

            return new Promise((resolve, reject) => {
                ffmpeg(filePathIn)
                    .size("320x?")
                    .format("webp")
                    .on("error", (err) => reject(err))
                    .on("end", () => resolve(filePathOut))
                    .save(filePathOut)
            })

        }
        try {

            await createSticker();

            return filePathOut
        } catch {
            return null
        }
    }

}

module.exports = {
    createSticker
}