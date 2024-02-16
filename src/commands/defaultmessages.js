const { configBot } = require('../config/config')
function menu(userName, dataFormatada, horas, minutos, prefix){

    let prefixes = ''
    
    configBot.prefixes.forEach((p)=>{prefixes = prefixes + p + ' '})

    text = 
`
╔══════════════ 
│ Inky Bot (beta)
│ Usuário: ${userName} 
│ Data: ${dataFormatada} 
│ Hora: ${horas}:${minutos}
│ Prefixos: [ ${prefixes}]  
├══════════════ 
│
│ Obrigado ao usar nosso bot 😊
│ No momento o bot está passsando por
│ fases de teste. Qualquer sugestão ou 
│ bug, utilize o seguinte comando:
│ 
│ -> ${prefix}sugestao [texto]
├══════════════ 
│  Comandos
│
│ -> ${prefix}sticker
│ -> ${prefix}criador
│ -> ${prefix}github
╰══════════════ 
`
    return text;
}

module.exports = {
    menu,
}