const { configBot } = require('../config/config')
const { BOT_COMMANDS } = require('../commands/commands')
function menu(userName, dataFormatada, horas, minutos, segundos, prefix){

    let prefixes = ''
    let botName = '`Inky Bot v0.3.1 (beta)`'
    configBot.prefixes.forEach((p)=>{prefixes = prefixes + p + ' '})

    text = 
`
╭───────────────────────╮ 
│                ${botName}              
╰───────────────────────╯
Oi, ${userName} :) 

Informações:
Data: ${dataFormatada} 
Hora: ${horas}:${minutos}:${segundos}
Prefixos: [ ${prefixes}]  

Obrigado ao usar nosso bot 😊
No momento o bot está passsando por
fases de teste. Qualquer sugestão ou 
bug, utilize os comandos:

${prefix}${BOT_COMMANDS.SUGESTAO} [texto]
${prefix}${BOT_COMMANDS.BUG} [texto]

Meus comandos

${prefix}${BOT_COMMANDS.STICKER}
> Gere figurinhas de imagens e vídeos menores do que 10 segundos

${prefix}${BOT_COMMANDS.CRIADOR}
> Obtém as informações de contato do meu criador

${prefix}${BOT_COMMANDS.GITHUB}
> Obtém as informações do GitHub do meu criador

${prefix}${BOT_COMMANDS.PLAY_VIDEO} [nome do vídeo do yt]
> (comando beta) Baixe videos do YouTube

${prefix}${BOT_COMMANDS.PLAY_AUDIO} [nome do video do yt]
> (comando beta) Baixe áudios de videos do YouTube 

${prefix}${BOT_COMMANDS.INKY} [pergunta]
> (comando beta) Gere resposta de inteligência artificial 

:)

`
    return text;
}

module.exports = {
    menu,
}