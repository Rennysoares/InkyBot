const {
    sendText,
} = require('../utils/answers');

async function suggestion(sock, messageFrom, messageReceived, args) {
    await sock.sendPresenceUpdate('composing', messageFrom);
    if (args.length == 0) {
        text = `Não irei conseguir me desenvolver com uma sugestão vazia :(`
        await sendText(sock, messageFrom, text, messageReceived)
        return
    }
    text = `Obrigado pelo apoio, sua opnião é muito importante para o meu desenvolvimento`
    await sendText(sock, messageFrom, text, messageReceived)
}

module.exports = { suggestion };