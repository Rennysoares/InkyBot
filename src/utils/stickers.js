
const {
    downloadContentFromMessage
} = require('@whiskeysockets/baileys');



const pino = require('pino');
const { promisify } = require("util");
const fs = require('fs');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');

ffmpeg.setFfmpegPath(ffmpegPath);
const execAsync = promisify(require("child_process").exec);

async function createSticker(messageReceived, messageType){

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
    
    console.log(mediaType)

    if (mediaType == "video" && mediaKey.seconds > 10) {
        console.log('Video muito longo')
        return 
        }
    
    if (mediaType == "video"){
        console.log("VIDEO DETECTADO")
        console.log("Downloading...")
        const buffer = await getFileBufferFromWhatsapp(mediaKey, mediaType);
        console.log("Buffering...")
        fs.writeFileSync("./src/temp/sticker.mp4", buffer);

        const createSticker = () => {
            
            return new Promise ((resolve, reject) => {
                ffmpeg("./src/temp/sticker.mp4")
                .format("webp")
                .size("200x200")
                .noAudio()
                .fps(10)
                .on("error", (err) => reject(err))
                .on("end", ()=> resolve("./src/temp/sticker.webp"))
                .save("./src/temp/sticker.webp")
            })

        }
        try{
            console.log("Creating Sticker...")
            await createSticker();
            console.log("Sucessfull")
            return './src/temp/sticker.webp'
        }catch{
            return null
        }
    }

    if (mediaType == "image"){
        console.log("IMAGEM DETECTADA")
        console.log("Downloading...")
        const buffer = await getFileBufferFromWhatsapp(mediaKey, mediaType);
        console.log("Buffering...")
        fs.writeFileSync("./src/temp/sticker.png", buffer);

        const createSticker = () => {
            
            return new Promise ((resolve, reject) => {
                ffmpeg("./src/temp/sticker.png")
                .format("webp")
                .size("?x320")
                .keepDAR()
                .autoPad("#00ffffff")
                .on("error", (err) => reject(err))
                .on("end", ()=> resolve("./src/temp/sticker.webp"))
                .save("./src/temp/sticker.webp")
            })

        }
        try{
            console.log("Creating Sticker...")
            await createSticker();
            console.log("Sucessfull")
            return './src/temp/sticker.webp'
        }catch{
            return null
        }
    } 

}

module.exports = {
    createSticker
}