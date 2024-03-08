
const {
    downloadContentFromMessage
} = require('@whiskeysockets/baileys');

const pino = require('pino');
const { promisify } = require("util");
const fs = require('fs');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
const { botCommands } = require('../commands/commands')
const { configBot } = require('../config/config')
ffmpeg.setFfmpegPath(ffmpegPath);
const execAsync = promisify(require("child_process").exec);
const {
    sendText,
    sendSticker,
    sendImage,
    sendReaction,
} = require('../utils/answers');

const loadingSticker = '⌛'
const { addStickerMetaData } = require("./addStickerMetaData")
async function createSticker(messageReceived, messageType, command) {

    const mediaQuoted = messageReceived.message.extendedTextMessage?.contextInfo?.quotedMessage;
    const mediaKey = mediaQuoted ? (mediaQuoted.imageMessage || mediaQuoted.videoMessage || mediaQuoted.stickerMessage) : messageReceived.message[messageType];
    const mediaType = "seconds" in mediaKey ? "video" : "image";
    const isVideo = "seconds" in mediaKey;
    const isLargeVideo = isVideo && mediaKey.seconds > 10;
    if (isLargeVideo) return 'videolarge';

    const randomId = `${Math.random().toString(36).substring(2, 10)}`;
    const filePathIn = `./src/temp/media/file_${randomId}.${isVideo ? 'mp4' : 'png'}`;
    const filePathOut = `./src/temp/media/file_${randomId}.webp`;

    const getFileBufferFromWhatsapp = async (mediaKey, mediaType) => {
        const stream = await downloadContentFromMessage(mediaKey, mediaType);
        const chunks = [];

        for await (const chunk of stream) {
            chunks.push(chunk);
        }

        return Buffer.concat(chunks);

    };
    
    const buffer = await getFileBufferFromWhatsapp(mediaKey, mediaType);
    fs.writeFileSync(filePathIn, buffer);


    const optionsFormat = [
        `-vcodec`, `libwebp`, `-vf`,
        `scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse`
    ];

    const optionsSimple = [
        `-vcodec`, `libwebp`, `-vf`,
        `scale=320:320,fps=15`
    ];

    return new Promise((resolve, reject) => {
        ffmpeg(filePathIn)
            .format("webp")
            .addOutputOptions(botCommands.sticker.formatCommands.includes(command) ? optionsFormat : optionsSimple)
            .on("error", (err) => reject(err))
            .on("end", () => resolve(filePathOut))
            .save(filePathOut);
    }).catch(err => {
        console.error(err);
        return null;
    });

}

async function stickers(sock, messageFrom, messageReceived, pushName, messageType, command, currentPrefix){
    if (
        messageReceived.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage ||
        messageReceived.message?.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage ||
        messageReceived.message?.imageMessage ||
        messageReceived.message?.videoMessage
    ) {
        await sendReaction(sock, messageFrom, loadingSticker, messageReceived)

        const directorySticker = await createSticker(messageReceived, messageType, command)

        if (directorySticker == 'videolarge') {
            text = `Vídeo muito longo. Mande vídeos menores do que 10 segundos`
            await sendText(sock, messageFrom, text, messageReceived)
            await sendReaction(sock, messageFrom, '', messageReceived)
            return
        }

        if (directorySticker) {

            const stickerMetaData = {
                packname: "Gerada por:\n↘ Inky Bot\n\n Contato do Bot:\n↘ +55 92 8532-0942",
                author: `Dono\n↘ Renny\n\nSolicitado:\n↘ ${pushName}`,
            };
            await addStickerMetaData(directorySticker, stickerMetaData)
            await sendSticker(sock, messageFrom, directorySticker, messageReceived)
            await sendReaction(sock, messageFrom, '', messageReceived)
        } else {
            //console.log('Erro na produção do sticker')
            text = `Foi mal, não consegui gerar a figurinha. O erro foi reportado ao desenvolvedor`
            await sendText(sock, messageFrom, text, messageReceived)
            await sendReaction(sock, messageFrom, '', messageReceived)
        }

    } else {

        if (messageReceived.message?.extendedTextMessage?.contextInfo?.quotedMessage?.stickerMessage) {
            //console.log('Marcou a figurinha com o comando s ou sticker')
            text = `Tu tá maluco doido kakaka querendo fazer uma figurinha de uma figurinha kakakakak. Use o comando em uma imagem ou vídeo`
            await sendText(sock, messageFrom, text, messageReceived)
            await sendReaction(sock, messageFrom, '', messageReceived)
        } else if (messageReceived.message?.extendedTextMessage?.contextInfo?.quotedMessage?.audioMessage) {
            text = `Tu tá maluco doido kakaka querendo fazer uma figurinha de um áudio kakakakak. Use o comando em uma imagem ou vídeo`
            await sendText(sock, messageFrom, text, messageReceived)
            await sendReaction(sock, messageFrom, '', messageReceived)
        } else {
            //Não há midia
            //console.log('Não há nenhuma mídia para fazer a figurinha')
            text = `Você deve marcar a mídia ou postá-la com o comando ${currentPrefix}sticker ou ${currentPrefix}s 🤨`
            await sendText(sock, messageFrom, text, messageReceived)
            await sendReaction(sock, messageFrom, '', messageReceived)
        }

    }
}
module.exports = {
    createSticker,
    stickers
}