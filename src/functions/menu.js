const {
    sendText,
    sendImage,
} = require('./answers');

const { botSettings } = require('../config/config')
const { botCommands } = require('../commands/commands')

async function menuFunc(sock, messageFrom, messageReceived, pushName, currentPrefix) {

    const date = new Date();
    const formDate = date.toLocaleDateString();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    const hour = hours < 10 ? '0' + hours : hours;
    const minute = minutes < 10 ? '0' + minutes : minutes;
    const second = seconds < 10 ? '0' + seconds : seconds;

    let prefixes = ''
    let botName = '`Inky Bot v0.4.2 (beta)`'
    botSettings.prefixes.forEach((p) => { prefixes = prefixes + p + ' ' });
    let quote = '`'
    let commandInfo = '';

    var madrugadaLimite = 5;
    var manhaLimite = 12; // Até meio-dia
    var tardeLimite = 18; // Até às 18h (6 PM)
    var salutation = ''
    // Verifica em qual período do dia estamos
    if (hours < madrugadaLimite) {
        salutation = 'Boa madrugada'
    } else if (hours < manhaLimite) {
        salutation = 'Bom dia'
    } else if (hours < tardeLimite) {
        salutation = 'Boa tarde'
    } else {
        salutation = 'Boa noite'
    }
    // Iterando sobre o objeto botCommands usando forEach
    Object.entries(botCommands).forEach(([commandName, commandData]) => {

        const alternativeCommands = [...commandData.commands]; // Criando uma cópia da array original
        alternativeCommands.shift();

        commandInfo += `${quote}${currentPrefix}${commandData.commands[0]}${quote}${commandData?.argDesc ? ' [' + commandData?.argDesc + ']' : ''}\n`;
        commandInfo += `> ${commandData.description}\n`;
        commandInfo += `${commandData.commands.length > 1 ? '> Alternativos: ' + currentPrefix + alternativeCommands.join(' .') + '\n' : ''}`;
        commandInfo += `${commandData?.tip ? '> Dica: ' + commandData.tip + '\n' : ''}`;
        commandInfo += '\n';
    });

    text =
`
╭──────────────────╮ 
│      ${botName}              
╰──────────────────╯
Oi, ${pushName}! ${salutation}

Hoje é *${formDate}*
Agora são *${hour}:${minute}:${second}* (GMT-4)

Prefixos Disponíveis: [ ${prefixes}]  

Meus comandos:

${commandInfo}
:)`

    image = './src/assets/inky.jpg'
    await sendText(sock, messageFrom, text, messageReceived)
    //await sendImage(sock, messageFrom, { url: image }, text, messageReceived)
}

module.exports = {
    menuFunc,
}