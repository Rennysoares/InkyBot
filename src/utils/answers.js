async function sendText(sock, messageFrom, text, quoted,) {
  await sock.sendMessage(
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
  await sock.sendMessage(
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
  await sock.sendMessage(to, { audio: { url: audioUrl }, mimetype: "audio/mpeg" },{ quoted })
}


function getMessageText(messageInfo, messageType) {
  const messageTypes = {
    conversation: messageInfo?.message?.conversation,
    imageMessage: messageInfo?.message?.imageMessage?.caption,
    videoMessage: messageInfo?.message?.videoMessage?.caption,
    extendedTextMessage: messageInfo?.message?.extendedTextMessage?.text
  }

  return messageTypes[messageType] || "";
}

module.exports = {
  sendText,
  sendSticker,
  sendImage,
  sendReaction,
  sendVideo,
  sendAudio,
  getMessageText,
};
