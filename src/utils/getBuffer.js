import { downloadContentFromMessage } from '@whiskeysockets/baileys';
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));
export const getFileBuffer = async (mediaKey, mediaType) => {
    const stream = await downloadContentFromMessage(mediaKey, mediaType);
    const chunks = [];

    for await (const chunk of stream) {
        chunks.push(chunk);
    }

    return Buffer.concat(chunks);
};

export const getBuffer = async (url) => {
    let response = await fetch(url, {
      method: "get",
      body: null,
    });
  
    let media = await response.arrayBuffer();
    const nodeBuffer = Buffer.from(media);
    return nodeBuffer;
  };