//Imports 

const {
    sendText,
} = require('../utils/answers');

const { menuFunc } = require('../utils/menu');
const { stickers } = require('../utils/stickers');
const { suggestion } = require('../utils/suggestion');
const { bug } = require('../utils/bug')
const { downloadMediaYt } = require('../utils/mediayt');
const { InkyIaAnswer } = require('../utils/iaanswers');
const { pingInky } = require('../utils/ping');

const { botCommands } = require('../commands/commands');
const { configBot } = require('../config/config');


async function processorMessage(sock, messageReceived, messageType) {

    //Constante booleana que verifica se a mensagem processada foi o host que enviou
    const isFromMe = messageReceived.key.fromMe;

    //informações do usuário
    const messageFrom = messageReceived.key.remoteJid;
    const pushName = messageReceived.pushName;
    const userIsGroup = messageFrom.endsWith("@g.us")

    //Pegar texto
    const messageTypes = {
        conversation: messageReceived?.message?.conversation,
        imageMessage: messageReceived?.message?.imageMessage?.caption,
        videoMessage: messageReceived?.message?.videoMessage?.caption,
        extendedTextMessage: messageReceived?.message?.extendedTextMessage?.text
    }

    //Constante com operador de coalescência nula que verifica se há valor falso na verificação da propriedade do objeto 'messsageTypes'
    const textMessage = messageTypes[messageType] || "";

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

    const trat =
        isCommand ?
            textMessage.slice(1)
                .trim()
                .split(" ")
                .map(word => word.toLowerCase())
                .join(" ")
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, "")
                .split(" ")
            : null;

    let command = isCommand ? trat[0] : null;

    let args = isCommand ? textMessage.trim().split(/ +/).splice(1) : null;

    if (args !== null) {
        if (args[0]?.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase() == command) {
            test = args.shift()
        }
        args = args.join(" ")
    }

    //data e hora


    //outros

    //Atualizar presença

    const showConsoleLog = () => {

        const messageTypes = {
            conversation: 'a mensagem',
            imageMessage: 'a imagem',
            videoMessage: ' video',
            stickerMessage: 'a figurinha',
            audioMessage: ' audio',
            documentMessage: ' documento',
            contactMessage: ' contato',
            extendedTextMessage: 'a mensagem extendida ou link',
            locationMessage: 'a localizacao',
            messageContextInfo: 'a enquete ou derivados'
        }

        messageTypeCurrent = messageTypes[messageType] || "";

        showMessage = textMessage ? '\nMensagem: ' + textMessage : "";
        console.log(
            '\nUsuário: ' + pushName +
            '\nId: ' + messageFrom +
            '\nEnviou um' + messageTypeCurrent +
            showMessage
        )

    }
    configBot.isConsoleLog && !isFromMe ? showConsoleLog() : null;

    const listCommands = {
        menu: async () => { await menuFunc(sock, messageFrom, messageReceived, pushName, currentPrefix) },
        sticker: async () => { await stickers(sock, messageFrom, messageReceived, pushName, messageType, command, currentPrefix) },
        sugestao: async () => { await suggestion(sock, messageFrom, messageReceived, args) },
        bug: async () => { await bug(sock, messageFrom, messageReceived, args) },
        play_audio: async () => { await downloadMediaYt(sock, messageFrom, args, command, messageReceived) },
        play_video: async () => { await downloadMediaYt(sock, messageFrom, args, command, messageReceived) },
        inky: async () => { await InkyIaAnswer(sock, messageFrom, args, messageReceived) },
        ping: async () => { await pingInky(sock, messageFrom, messageReceived) }
    }
    //Alias
    //listCommands.m = listCommands.menu

    //botCommands.ping.commands.includes(command) <-booleano

    let commandFound = false;

    if (isCommand) {
        for (const commandKey in botCommands) {
            if (Object.prototype.hasOwnProperty.call(botCommands, commandKey)) {
                const commandData = botCommands[commandKey];
                // Verifica se a string command está presente em qualquer uma das arrays do comando
                const foundInCommands = commandData.commands.includes(command);
                const foundInFormatCommands = commandData.formatCommands ? commandData.formatCommands.includes(command) : false;
                // Se a string estiver presente em alguma das arrays, imprime que foi encontrada
                if (foundInCommands || foundInFormatCommands) {
                    console.log(`A string '${command}' foi encontrada no comando '${commandKey}'.`);
                    const execFunc = listCommands[commandKey]
                    execFunc ? await execFunc() : await sendText(sock, messageFrom,  `Este comando está em desenvolvimento. Utilize ${currentPrefix}menu para ver os comandos disponíveis `, messageReceived);
                    commandFound = true;
                    break;
                }
            }
        }
    }

    if (!commandFound && isCommand) {
        await sendText(
            sock,
            messageFrom, 
            `Este comando não existe. Utilize ${currentPrefix}menu para ver os comandos disponíveis `,
            messageReceived);
    }
    /*
    if (isCommand) {
        console.log('é um comando')
        
    }
    */
    await sock.sendPresenceUpdate('available', messageFrom);
}

module.exports = processorMessage;