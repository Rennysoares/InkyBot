import {
    sendText,
} from '../commands/answers.js';

export async function bug(sock, messageFrom, messageReceived, args) {
    await sock.sendPresenceUpdate('composing', messageFrom);
    if (args.length == 0) {
        text = `Não irei conseguir me desenvolver com uma sugestão de correção de bug vazia :(`
        await sendText(sock, messageFrom, text, messageReceived)
        return
    }
    const text = `Obrigado pelo apoio, sua opnião é muito importante para o meu desenvolvimento`
    await sendText(sock, messageFrom, text, messageReceived)
}
