export async function sendText(sock, messageFrom, text, quoted,) {
  return await sock.sendMessage(
    messageFrom, 
    { 
      text: text
    }, 
    {
      quoted
    }
  );
}

export async function sendSticker(sock, messageFrom, sticker, quoted) {
  await sock.sendMessage(
    messageFrom,
    {
      sticker:
      {
        url: sticker
      }
    },
    {
      quoted
    }
  );
}

export async function sendImage(sock, messageFrom, image, caption = "", quoted) {
  return await sock.sendMessage(
    messageFrom, 
    { 
      image: image,
      caption 
    }, 
    { 
      quoted 
    }
    );
}

export async function sendReaction(sock, messageFrom, emoji, messageReceived) {
  await sock.sendMessage(messageFrom, { react: { text: emoji, key: messageReceived.key } })
}

export async function sendVideo(sock, to, video, quoted) {
  await sock.sendMessage(to, { video: video,}, { quoted });
}

export async function sendAudio(sock, to, audioUrl, quoted) {
  await sock.sendMessage(to, { audio: { url: audioUrl }, mimetype: "audio/mp4" },{ quoted })
}
