const { configBot } = require('../config/config')
const { BOT_COMMANDS } = require('../commands/commands')
function menu(userName, dataFormatada, horas, minutos, segundos, prefix){

    let prefixes = ''
    
    configBot.prefixes.forEach((p)=>{prefixes = prefixes + p + ' '})

    text = 
`
╭───────────────────────╮ 
│                Inky Bot v0.2 (beta)               
├───────────────────────╯
│ Oi, ${userName} :) 
├────────────────────────
│ Informações:
│ Data: ${dataFormatada} 
│ Hora: ${horas}:${minutos}:${segundos}
│ Prefixos: [ ${prefixes}]  
├────────────────────────
│ Obrigado ao usar nosso bot 😊
│ No momento o bot está passsando por
│ fases de teste. Qualquer sugestão ou 
│ bug, utilize os comandos:
│ 
│ -> ${prefix}${BOT_COMMANDS.SUGESTAO} [texto]
│ -> ${prefix}${BOT_COMMANDS.BUG} [texto]
├────────────────────────
│
│ Meus comandos
│
│ -> ${prefix}${BOT_COMMANDS.STICKER}
│ -> ${prefix}${BOT_COMMANDS.CRIADOR}
│ -> ${prefix}${BOT_COMMANDS.GITHUB}
│ -> ${prefix}${BOT_COMMANDS.PLAY_VIDEO} [nome do vídeo do yt]
│ -> ${prefix}${BOT_COMMANDS.PLAY_AUDIO} [nome do video do yt]
│
├────────────────────────
│ :)
╰────────────────────────
`
    return text;
}

module.exports = {
    menu,
}