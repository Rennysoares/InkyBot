async function sendText(sock, messageFrom, text, quoted,) {
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

async function sendSticker(sock, messageFrom, sticker, quoted) {
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

async function sendImage(sock, messageFrom, image, caption = "", quoted) {
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

async function sendReaction(sock, messageFrom, emoji, messageReceived) {
  await sock.sendMessage(messageFrom, { react: { text: emoji, key: messageReceived.key } })
}

async function sendVideo(sock, to, video, quoted) {
  await sock.sendMessage(to, { video: video,}, { quoted });
}

async function sendAudio(sock, to, audioUrl, quoted) {
  await sock.sendMessage(to, { audio: { url: audioUrl }, mimetype: "audio/mp4" },{ quoted })
}


module.exports = {
  sendText,
  sendSticker,
  sendImage,
  sendReaction,
  sendVideo,
  sendAudio,
};
