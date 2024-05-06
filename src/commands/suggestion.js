import {
    sendText,
} from '../commands/answers.js';

export async function suggestion(sock, messageFrom, messageReceived, args) {
    await sock.sendPresenceUpdate('composing', messageFrom);
    if (args.length == 0) {
        const text = `Não irei conseguir me desenvolver com uma sugestão vazia :(`
        await sendText(sock, messageFrom, text, messageReceived)
        return
    }
    text = `Obrigado pelo apoio, sua opnião é muito importante para o meu desenvolvimento`
    await sendText(sock, messageFrom, text, messageReceived)
}

