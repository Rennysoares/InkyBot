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
const { downloadMediaYt } = require('../utils/mediayt');

async function processorMessage(sock, messageReceived, messageType) {

    //informações do usuário
    const messageFrom = messageReceived.key.remoteJid;
    const pushName = messageReceived.pushName;

    //mensagem recebida
    const textMessage = getMessageText(messageReceived, messageType);

    //tratamentos de comandos e argumentos
    let isCommand = configBot.prefixes.includes(textMessage[0]) ? true : false;

    //Chave de identificação de mensagem e emissor
    const key = {
        remoteJid: messageReceived.key.remoteJid,
        id: messageReceived.key.id, // id of the message you want to read
        participant: messageReceived?.key?.participant // the ID of the user that sent the  message (undefined for individual chats)
    }
    //Marcar a mensagem como lida
    isCommand ? await sock.readMessages([key]) : null;

    let currentPrefix = isCommand ? textMessage[0] : null;
    const trat = isCommand ? textMessage.slice(1).trim().split(" ").map(word => word.toLowerCase()).join(" ").normalize('NFD').replace(/[\u0300-\u036f]/g, "").split(" ")
        : null;
    let command = isCommand ? trat[0] : null
    //console.log(command)

    let args = isCommand ? textMessage.trim().split(/ +/).splice(1) : null;

    if (args !== null) {
        if (args[0]?.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase() == command) {
            test = args.shift()
        }
        args = args.join(" ")
    }

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

    configBot.isConsoleLog ? console.log('\nUsuário: ' + messageReceived.pushName + '\nTipo: ' + messageType + '\nMensagem: ' + textMessage) : null

    if (isCommand) {
        if (command == BOT_COMMANDS.MENU) {
            await sock.sendPresenceUpdate('composing', messageFrom);
            text = menu(pushName, dataFormatada, hora, minuto, segundo, currentPrefix)
            image = './src/assets/inky.jpg'
            //await sendText(sock, messageFrom, text, messageReceived)
            await sendImage(sock, messageFrom, {url: image}, text, messageReceived)
        } else if (command == BOT_COMMANDS.STICKER || command == BOT_COMMANDS.STICKERABREV) {

            if (
                messageReceived.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage ||
                messageReceived.message?.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage ||
                messageReceived.message?.imageMessage ||
                messageReceived.message?.videoMessage
            ) {
                await sendReaction(sock, messageFrom, loadingSticker, messageReceived)
                const directorySticker = await createSticker(messageReceived, messageType)

                if (directorySticker == 'videolarge') {
                    text = `Vídeo muito longo. Mande vídeos menores do que 10 segundos`
                    await sendText(sock, messageFrom, text, messageReceived)
                    await sendReaction(sock, messageFrom, '', messageReceived)
                    return
                }

                if (directorySticker) {

                    const stickerMetaData = {
                        packname: "Gerada por:\n↘ Inky Bot\n\n Contato do Bot:\n↘ +55 92 8532-0942",
                        author: `Dono\n↘ Renny\n\nSolicitado:\n↘ ${pushName}`,
                    };
                    await addStickerMetaData(directorySticker, stickerMetaData)
                    await sendSticker(sock, messageFrom, directorySticker, messageReceived)
                    await sendReaction(sock, messageFrom, '', messageReceived)
                } else {
                    //console.log('Erro na produção do sticker')
                    text = `Foi mal, não consegui gerar a figurinha. O erro foi reportado ao desenvolvedor`
                    await sendText(sock, messageFrom, text, messageReceived)
                    await sendReaction(sock, messageFrom, '', messageReceived)
                }

            } else {

                if (messageReceived.message?.extendedTextMessage?.contextInfo?.quotedMessage?.stickerMessage) {
                    //console.log('Marcou a figurinha com o comando s ou sticker')
                    text = `Tu tá maluco doido kakaka querendo fazer uma figurinha de uma figurinha kakakakak. Use o comando em uma imagem ou vídeo`
                    await sendText(sock, messageFrom, text, messageReceived)
                    await sendReaction(sock, messageFrom, '', messageReceived)
                } else if (messageReceived.message?.extendedTextMessage?.contextInfo?.quotedMessage?.audioMessage) {
                    text = `Tu tá maluco doido kakaka querendo fazer uma figurinha de um áudio kakakakak. Use o comando em uma imagem ou vídeo`
                    await sendText(sock, messageFrom, text, messageReceived)
                    await sendReaction(sock, messageFrom, '', messageReceived)
                } else {
                    //Não há midia
                    //console.log('Não há nenhuma mídia para fazer a figurinha')
                    text = `Você deve marcar a mídia ou postá-la com o comando ${currentPrefix}sticker ou ${currentPrefix}s 🤨`
                    await sendText(sock, messageFrom, text, messageReceived)
                    await sendReaction(sock, messageFrom, '', messageReceived)
                }

            }

        } else if (command == BOT_COMMANDS.GITHUB) {
            await sock.sendPresenceUpdate('composing', messageFrom);
            text = `Github do criador:\nhttps://github.com/Rennysoares/`
            await sendText(sock, messageFrom, text, messageReceived)
        } else if (command == BOT_COMMANDS.CRIADOR) {
            await sock.sendPresenceUpdate('composing', messageFrom);
            text = `wa.me/559295059178`
            await sendText(sock, messageFrom, text, messageReceived)
        } else if (command == BOT_COMMANDS.SUGESTAO) {
            await sock.sendPresenceUpdate('composing', messageFrom);
            if (args.length == 0) {
                text = `Não irei conseguir me desenvolver com uma sugestão vazia :(`
                await sendText(sock, messageFrom, text, messageReceived)
                return
            }
            text = `Obrigado pelo apoio, sua opnião é muito importante para o meu desenvolvimento`
            await sendText(sock, messageFrom, text, messageReceived)
        } else if (command == BOT_COMMANDS.BUG) {
            if (args.length == 0) {
                text = `Não irei conseguir me desenvolver com uma sugestão de correção de bug vazia :(`
                await sendText(sock, messageFrom, text, messageReceived)
                return
            }
            text = `Obrigado pelo apoio, sua opnião é muito importante para o meu desenvolvimento`
            await sendText(sock, messageFrom, text, messageReceived)
        } else if (command == BOT_COMMANDS.PLAY_VIDEO || command == BOT_COMMANDS.PLAY_AUDIO) {
            if (args.length == 0) {
                text = `Sou um bot, não um advinhador ;-;`
                await sendText(sock, messageFrom, text, messageReceived)
                return
            }
            await downloadMediaYt(sock, messageFrom, args, command, messageReceived)
        }
        else {
            text = `Este comando não existe. Por favor, utilize ${currentPrefix}menu para ver os comandos disponíveis `
            await sendText(sock, messageFrom, text, messageReceived)
        }
    }
    await sock.sendPresenceUpdate('available', messageFrom);
}

module.exports = processorMessage;