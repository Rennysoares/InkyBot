
import { sendText } from './commands/answers.js';
import { botCommands } from './commands.js';
import { botSettings } from './config.js';

export default async function handlingMessages(sock, messageReceived) {

    const messageType = Object.keys(messageReceived.message)[0];

    const messageTypes = {
        conversation: messageReceived?.message?.conversation,
        imageMessage: messageReceived?.message?.imageMessage?.caption,
        videoMessage: messageReceived?.message?.videoMessage?.caption,
        extendedTextMessage: messageReceived?.message?.extendedTextMessage?.text
    }

    const textMessage = messageTypes[messageType] || "";

    let isCommand = botSettings.prefixes.includes(textMessage[0]) ? true : false;
    if (!isCommand) return;

    const isFromMe = messageReceived.key.fromMe;

    const messageFrom = messageReceived.key.remoteJid;
    const pushName = messageReceived.pushName;
    const userIsGroup = messageFrom.endsWith("@g.us");
    let idUser = userIsGroup ? messageReceived?.key?.participant : messageFrom;

    const groupData = userIsGroup ? await sock.groupMetadata(messageFrom) : "";
    const groupMembers = userIsGroup ? groupData.participants : ""
    const groupInfo = {
        id: groupData.id,
        title: groupData.subject,
        description: groupData.desc,
        groupOwnerId: groupData.owner,
        groupSize: groupData.size
    }
    const admins = userIsGroup ? groupData.participants.filter(participant => participant.admin) : '';

    const key = {
        remoteJid: messageReceived.key.remoteJid,
        id: messageReceived.key.id, 
        participant: messageReceived?.key?.participant 
    }

    isCommand ? await sock.readMessages([key]) : null;

    let currentPrefix = isCommand ? textMessage[0] : null;

    const trat = isCommand ? textMessage.slice(1)
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
            let test = args.shift()
        }
        args = args.join(" ")
    }

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

        const messageTypeCurrent = messageTypes[messageType] || "";

        const showMessage = textMessage ? '\nMensagem: ' + textMessage : "";

        console.log(
            '\nUsuário: ' + pushName +
            '\nId: ' + idUser +
            '\nEnviou um' + messageTypeCurrent +
            showMessage
        )

    }
    
    botSettings.isConsoleLog && !isFromMe ? showConsoleLog() : null;

    let commandFound = false;

    if (isCommand) {

        if (command == 'teste'){
            
            await sock.relayMessage(
                messageFrom,
                {
                    interactiveMessage:{
                        body: {
                            text: "Testando"
                        },
                        footer: {
                            text: "Inky"
                        },
                        nativeFlowMessage: {
                            buttons: [
                                {
                                    name: "cta_url",
                                    buttonParamsJson: JSON.stringify({
                                        title: "Teste",
                                        sections: [{
                                            title: "aaaa",
                                            highlight_label: "abbbb",
                                            rows: [{
                                                id: "aaaaa",
                                                header: "bbbbb",
                                                title: "ccccc",
                                                description: "dddddd"
                                            }]
                                      }]
                                    })

                                    
                                }
                            ],
                            messageParamsJson: ""
                        }
                    }
                },
                {messageReceived}
            ).then((r) => console.log(r));
            return
        }

        const params = {
            sock,
            args,
            messageFrom, 
            messageReceived, 
            messageType, 
            command, 
            pushName,
            currentPrefix,
        };

        for (const commandKey in botCommands) {
            if (Object.prototype.hasOwnProperty.call(botCommands, commandKey)) {
                const commandData = botCommands[commandKey];
                const foundInCommands = commandData.commands.includes(command);
                const foundInFormatCommands = commandData.formatCommands ? commandData.formatCommands.includes(command) : false;
                if (foundInCommands || foundInFormatCommands) {
                    const execFunc = botCommands[commandKey].execution
                    execFunc ? await execFunc(params) : await sendText(sock, messageFrom, `Este comando está em desenvolvimento. Utilize ${currentPrefix}menu para ver os comandos disponíveis `, messageReceived);
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
            `Use${currentPrefix}menu para ver os comandos disponíveis `,
            messageReceived);
    }
    await sock.sendPresenceUpdate('available', messageFrom);
}