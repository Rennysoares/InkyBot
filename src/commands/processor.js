//Imports 
const {
    sendText,
    sendSticker,
    sendImage,
    sendReaction,
    getMessageText,
} = require('../utils/answers');

const { configBot } = require('../config/config')
const { BOT_COMMANDS } = require('../commands/commands');
const { menu } = require('./defaultmessages');
const { createSticker } = require('../utils/stickers');
const addStickerMetaData = require('../utils/addStickerMetaData');

async function processorMessage(sock, messageReceived, messageType) {

    //informações do usuário
    const messageFrom = messageReceived.key.remoteJid;
    const pushName = messageReceived.pushName;

    //mensagem recebida
    const textMessage = getMessageText(messageReceived, messageType);

    //tratamentos de comandos
    let isCommand = configBot.prefixes.includes(textMessage[0]) ? true : false;
    let currentPrefix = isCommand ? textMessage[0] : null;
    const command = isCommand ? textMessage.slice(1).split(/ +/).shift().toLowerCase() : null;

    //data e hora
    const dataAtual = new Date();
    const dataFormatada = dataAtual.toLocaleDateString();
    const horas = dataAtual.getHours();
    const minutos = dataAtual.getMinutes();
    const segundos = dataAtual.getSeconds();

    const hora = horas < 10 ? '0' + horas : horas;
    const minuto = minutos < 10 ? '0' + minutos : minutos;
    const segundo = segundos < 10 ? '0' + segundos : segundos;

    //outros
    const loadingSticker = '⌛'
    //Atualizar presença
    await sock.sendPresenceUpdate('available', messageFrom);

    console.log('\nUsuário: ' + messageReceived.pushName + '\nTipo: ' + messageType + '\nMensagem: ' + textMessage)

    if (isCommand) {

        if (command == BOT_COMMANDS.MENU) {
            text = menu(pushName, dataFormatada, hora, minuto, segundo, currentPrefix)
            image = './src/assets/inkybot.jpg'
            await sendImage(sock, messageFrom, image, messageReceived, text)
        } else if (command == BOT_COMMANDS.STICKER || command == BOT_COMMANDS.STICKERABREV) {

            if (
                messageReceived.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage ||
                messageReceived.message?.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage ||
                messageReceived.message?.imageMessage ||
                messageReceived.message?.videoMessage
            ) {
                await sendReaction(sock, messageFrom, loadingSticker, messageReceived)
                const directorySticker = await createSticker(messageReceived, messageType)
                if (directorySticker) {

                    console.log('Sticker Feito: ' + directorySticker)

                    const stickerMetaData = {
                        packname: "Gerada por:\n↘ Inky Bot\n\n Contato do Bot:\n↘ +55 92 8532-0942",
                        author: `Dono\n↘ Renny\n\nSolicitado:\n↘ ${pushName}`,
                    };
                    await addStickerMetaData(directorySticker, stickerMetaData)
                    await sendSticker(sock, messageFrom, directorySticker, messageReceived)
                    await sendReaction(sock, messageFrom, '', messageReceived)
                } else {
                    console.log('Erro na produção do sticker')
                    text = `Foi mal, não consegui gerar a figurinha. O erro foi reportado ao desenvolvedor`
                    sendText(sock, messageFrom, text, messageReceived)
                    await sendReaction(sock, messageFrom, '', messageReceived)
                }

            } else {

                if (messageReceived.message?.extendedTextMessage?.contextInfo?.quotedMessage?.stickerMessage) {
                    console.log('Marcou a figurinha com o comando s ou sticker')
                    text = `Tu tá maluco doido kakaka querendo fazer uma figurinha de uma figurinha kakakakak. Use o comando em uma imagem ou vídeo`
                    sendText(sock, messageFrom, text, messageReceived)
                    await sendReaction(sock, messageFrom, '', messageReceived)
                } else {
                    //Não há midia
                    console.log('Não há nenhuma mídia para fazer a figurinha')
                    text = `Você deve marcar a mídia ou postá-la com o comando ${currentPrefix}sticker ou ${currentPrefix}s 🤨`
                    sendText(sock, messageFrom, text, messageReceived)
                    await sendReaction(sock, messageFrom, '', messageReceived)
                }

            }

        } else if(command == BOT_COMMANDS.GITHUB){
            text = `github.com/Rennysoares/InkyBot`
            sendText(sock, messageFrom, text, messageReceived)
        } else if(command == BOT_COMMANDS.CRIADOR){
            text = `wa.me/559295059178`
            sendText(sock, messageFrom, text, messageReceived)
        } else {
            text = `Este comando não existe. Por favor, utilize ${currentPrefix}menu para ver os comandos disponíveis `
            sendText(sock, messageFrom, text, messageReceived)
        }
    }
}

module.exports = processorMessage;

