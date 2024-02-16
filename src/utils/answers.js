async function sendText(sock, messageFrom, text, quoted,) {
  await sock.sendMessage(messageFrom, { text: text }, { quoted });
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
    });
}

async function sendImage(sock, messageFrom, image, quoted, caption = "") {
  await sock.sendMessage(messageFrom, { image: { url: image }, caption }, { quoted });
}

async function sendReaction(sock, messageFrom, emoji, messageReceived) {
  await sock.sendMessage(messageFrom, { react: { text: emoji, key: messageReceived.key } })
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
  getMessageText,
};
