import {
    sendText,
} from '../commands/answers.js';

export async function bug(params) {
    await params.sock.sendPresenceUpdate('composing', params.messageFrom);
    if (!params.args) {
        let text = `Não irei conseguir me desenvolver com uma sugestão de correção de bug vazia :(`
        await sendText(params.sock, params.messageFrom, text, params.messageReceived)
        return
    }
    const text = `Obrigado pelo apoio, sua opinião é muito importante para o meu desenvolvimento`
    await sendText(params.sock, params.messageFrom, text, params.messageReceived)
}
