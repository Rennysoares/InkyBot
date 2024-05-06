import {
    sendText,
    sendImage,
} from './answers.js';

import { botSettings } from '../config.js';
import { botCommands } from '../commands.js';

export async function menuFunc(params) {

    const date = new Date();
    const formDate = date.toLocaleDateString();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    const hour = hours < 10 ? '0' + hours : hours;
    const minute = minutes < 10 ? '0' + minutes : minutes;
    const second = seconds < 10 ? '0' + seconds : seconds;

    let prefixes = ''
    let botName = '`Inky Bot v0.6.0 (beta)`'
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

        if(commandData.commands[0] == 'menu'){
            return
        }
        const alternativeCommands = [...commandData.commands]; // Criando uma cópia da array original
        alternativeCommands.shift();

        commandInfo += `${quote}${params.currentPrefix}${commandData.commands[0]}${quote}${commandData?.argDesc ? ' _' + commandData?.argDesc + '_' : ''}\n`;
        /**
        commandInfo += `> ${commandData.description}\n`;
        commandInfo += `${commandData.commands.length > 1 ? '> Alternativos: ' + currentPrefix + alternativeCommands.join(' .') + '\n' : ''}`;
        commandInfo += `${commandData?.tip ? '> Dica: ' + commandData.tip + '\n' : ''}`;
        commandInfo += '\n';
         */
        
    });

    const text =
`
╭──────────────────╮ 
│      ${botName}              
╰──────────────────╯
Oi, ${params.pushName}! ${salutation}

Aqui os meus comandos:

${commandInfo}
:)`

    const image = './src/assets/inky.jpg'
    //await sendText(sock, messageFrom, text, messageReceived)
    await sendImage(params.sock, params.messageFrom, { url: image }, text, params.messageReceived)
}