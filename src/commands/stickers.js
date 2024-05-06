
import { processSticker } from '../utils/processsticker.js';
import {
    sendText,
    sendReaction,
} from '../commands/answers.js';

export async function stickers(params) {

    const messageParams = params.messageReceived?.message
    const messageQuotedParams = messageParams?.extendedTextMessage?.contextInfo?.quotedMessage;

    if (
        messageQuotedParams?.imageMessage ||
        messageQuotedParams?.videoMessage ||
        messageParams?.imageMessage ||
        messageParams?.videoMessage
    ) {
        await sendReaction(params.sock, params.messageFrom, '⌛', params.messageReceived)
        await processSticker(params);
        await sendReaction(params.sock, params.messageFrom, '', params.messageReceived)
    } else {
        if (params.messageReceived.message?.extendedTextMessage?.contextInfo?.quotedMessage?.stickerMessage) {
            const text = `Tu tá maluco doido kakaka querendo fazer uma figurinha de uma figurinha kakakakak. Use o comando em uma imagem ou vídeo`
            await sendText(params.sock, params.messageFrom, text, params.messageReceived)
        } else if (params.messageReceived.message?.extendedTextMessage?.contextInfo?.quotedMessage?.audioMessage) {
            const text = `Tu tá maluco doido kakaka querendo fazer uma figurinha de um áudio kakakakak. Use o comando em uma imagem ou vídeo`
            await sendText(params.sock, params.messageFrom, text, params.messageReceived)
        } else {
            const text = `Você deve marcar a mídia ou postá-la com o comando ${params.currentPrefix}sticker ou ${params.currentPrefix}s 🤨`
            await sendText(params.sock, params.messageFrom, text, params.messageReceived)
        }
    }
}
