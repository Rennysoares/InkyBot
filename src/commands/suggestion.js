import {
    sendText,
} from '../commands/answers.js';

export async function suggestion(params) {
    await params.sock.sendPresenceUpdate('composing', params.messageFrom);
    if (!params.args) {
        const text = `Não irei conseguir me desenvolver com uma sugestão vazia :(`
        await sendText(params.sock, params.messageFrom, text, params.messageReceived)
        return
    }
    text = `Obrigado pelo apoio, sua opinião é muito importante para o meu desenvolvimento`
    await sendText(params.sock, params.messageFrom, text, params.messageReceived)
}

