

const ffmpeg = require('fluent-ffmpeg');


const fs = require('fs');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const webp = require("node-webpmux");

const {
    sendText,
    sendReaction,
} = require('../functions/answers');

async function stickers(sock, messageFrom, messageReceived, messageType, command, pushName){

    const addStickerMetaData = async (mediaPath, metadata) => {
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
        }
    }
    const getFileBufferFromWhatsapp = async (mediaKey, mediaType) => {
        const stream = await downloadContentFromMessage(mediaKey, mediaType);
        const chunks = [];

        for await (const chunk of stream) {
            chunks.push(chunk);
        }

        return Buffer.concat(chunks);
    };
    
    const makeSticker = async () => {
        
        const formatCommands = ["fs", "fsticker"];
    
        try{
            const mediaQuoted = messageReceived.message.extendedTextMessage?.contextInfo?.quotedMessage;
            const mediaKey = mediaQuoted ? (mediaQuoted.imageMessage || mediaQuoted.videoMessage || mediaQuoted.stickerMessage) : messageReceived.message[messageType];
            const mediaType = "seconds" in mediaKey ? "video" : "image";
            const isVideo = "seconds" in mediaKey;
            if (isVideo && mediaKey.seconds > 10){
                await sock.sendMessage(messageFrom, { text: "O vídeo não pode ter mais do que 10 segundos. Corte-a para ter 9 segundos ou menos" }, {quoted: messageReceived});
                return
            }
            
            const randomId = `${Math.random().toString(36).substring(2, 10)}`;
            const filePathIn = `./src/temp/file_${randomId}.${isVideo ? 'mp4' : 'png'}`;
            const filePathOut = `./src/temp/file_${randomId}.webp`;
            
            const buffer = await getFileBufferFromWhatsapp(mediaKey, mediaType);
            fs.writeFileSync(filePathIn, buffer);
            
            const options = formatCommands.includes(command) ?
            [
            `-vcodec`, `libwebp`, `-vf`,
            `scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse`] :
            [
            `-vcodec`, `libwebp`, `-vf`,
            `scale=320:320,fps=15`];
            
            await new Promise((resolve, reject) => {
                ffmpeg(filePathIn)
                .format("webp")
                .addOutputOptions(options)
                .on("error", (err) => reject(err))
                .on("end", () => resolve(filePathOut))
                .save(filePathOut);
            });
            
            const stickerMetaData = {
                packname: "Gerada por:\n↘ Inky Bot\n\n Contato do Bot:\n↘ +55 92 8532-0942",
                author: `Dono\n↘ Renny\n\nSolicitado:\n↘ ${pushName}`,
            };
            
            await addStickerMetaData(filePathOut, stickerMetaData)
            
            await sock.sendMessage(messageFrom,
            {
                sticker: {
                    url: filePathOut
                }
            },
            {
                quoted: messageReceived
            });
            await sendReaction(sock, messageFrom, '', messageReceived)
            fs.unlinkSync(filePathIn);
            fs.unlinkSync(filePathOut);
        } catch (error){
            await sock.sendMessage(messageFrom, { text: "Não consegui gerar a figurinha por problemas técnicos. Tente novamente" }, {quoted: messageReceived});
            if (fs.existsSync(filePathIn)) {
                fs.unlinkSync(filePathIn);
            }
            if (fs.existsSync(filePathOut)) {
                fs.unlinkSync(filePathOut);
            }
        }
}
    
    if (
        messageReceived.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage ||
        messageReceived.message?.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage ||
        messageReceived.message?.imageMessage ||
        messageReceived.message?.videoMessage
    ){
        await sendReaction(sock, messageFrom, '⌛', messageReceived)
        await makeSticker();
    } else {
        if (messageReceived.message?.extendedTextMessage?.contextInfo?.quotedMessage?.stickerMessage) {
            //console.log('Marcou a figurinha com o comando s ou sticker')
            text = `Tu tá maluco doido kakaka querendo fazer uma figurinha de uma figurinha kakakakak. Use o comando em uma imagem ou vídeo`
            await sendText(sock, messageFrom, text, messageReceived)
        } else if (messageReceived.message?.extendedTextMessage?.contextInfo?.quotedMessage?.audioMessage) {
            text = `Tu tá maluco doido kakaka querendo fazer uma figurinha de um áudio kakakakak. Use o comando em uma imagem ou vídeo`
            await sendText(sock, messageFrom, text, messageReceived)
        } else {
            //Não há midia
            //console.log('Não há nenhuma mídia para fazer a figurinha')
            text = `Você deve marcar a mídia ou postá-la com o comando ${currentPrefix}sticker ou ${currentPrefix}s 🤨`
            await sendText(sock, messageFrom, text, messageReceived)
        }
    }
}

module.exports = {stickers};