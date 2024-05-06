import fs from 'fs';
import { addStickerMetaData } from './metadatasticker.js';
import { getFileBuffer } from './getBuffer.js';
import { makeSticker } from './makesticker.js';

export const processSticker = async (params) => {

    const mediaQuoted = params.messageReceived.message.extendedTextMessage?.contextInfo?.quotedMessage;
    const mediaKey = mediaQuoted ? (mediaQuoted.imageMessage || mediaQuoted.videoMessage || mediaQuoted.stickerMessage) : params.messageReceived.message[params.messageType];
    const mediaType = "seconds" in mediaKey ? "video" : "image";
    const isVideo = "seconds" in mediaKey;

    if (isVideo && mediaKey.seconds > 10) {
        await sock.sendMessage(messageFrom, { text: "O vídeo não pode ter mais do que 10 segundos. Corte-a para ter 9 segundos ou menos" }, { quoted: messageReceived });
        return
    }

    const randomId = `${Math.random().toString(36).substring(2, 10)}`;
    const filePathIn = `./src/temp/file_${randomId}.${isVideo ? 'mp4' : 'png'}`;
    const filePathOut = `./src/temp/file_${randomId}.webp`;

    try {
        //Make Sticker
        const buffer = await getFileBuffer(mediaKey, mediaType);
        fs.writeFileSync(filePathIn, buffer);
        await makeSticker(params, filePathIn, filePathOut);

        //Add Metadata
        const stickerMetaData = {
            packname: "Gerada por:\n↘ Inky Bot\n\n Contato do Bot:\n↘ +55 92 8532-0942",
            author: `Dono\n↘ Renny\n\nSolicitado:\n↘ ${params.pushName}`,
        };
        await addStickerMetaData(filePathOut, stickerMetaData)

        await params.sock.sendMessage(params.messageFrom,
            {
                sticker: {
                    url: filePathOut
                }
            },
            {
                quoted: params.messageReceived
            });
            
        fs.unlinkSync(filePathIn);
        fs.unlinkSync(filePathOut);
    } catch (err) {
        console.error(err)
        await params.sock.sendMessage(params.messageFrom, { text: "Não consegui gerar a figurinha por problemas técnicos. Tente novamente" }, { quoted: params.messageReceived });
        if (fs.existsSync(filePathIn)) {
            fs.unlinkSync(filePathIn);
        }
        if (fs.existsSync(filePathOut)) {
            fs.unlinkSync(filePathOut);
        }
    }
}