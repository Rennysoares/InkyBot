import { downloadContentFromMessage } from '@whiskeysockets/baileys';
export const getFileBuffer = async (mediaKey, mediaType) => {
    const stream = await downloadContentFromMessage(mediaKey, mediaType);
    const chunks = [];

    for await (const chunk of stream) {
        chunks.push(chunk);
    }

    return Buffer.concat(chunks);
};