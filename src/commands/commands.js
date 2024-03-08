
const botCommands = {

    menu: {
        commands: ['menu', 'm'],
        description: 'Veja os principais comandos',
        help: 'Para você utilizar o comando...',
    },

    sticker: {
        commands: ['sticker', 's', 'fsticker', 'fs'],
        formatCommands: ['fsticker', 'fs'],
        description: 'Faça figurinhas de imagens e vídeos menores do que 10 segundos',
        tip: 'Use o comando fsticker ou fs com o prefixo para a figurinha não ficar esticado',
    },

    sugestao: {
        commands: ['sugestao'],
        description: 'Envie sugestões com este comando, assim você contribui ao meu desenvolvimento',
        argDesc: 'sua sugestão'
    },

    bug: {
        commands: ['bug'],
        description: 'Reporte bugs percebidos, assim recorrerei ao meu desenvolvedor',
        argDesc: 'bug encontrado'
    },


    play_video: {
        commands: ['play_video'],
        description: 'Baixe videos do YouTube',
        argDesc: 'nome do video'
    },

    play_audio: {
        commands: ['play_audio'],
        description: 'Baixe áudio de vídeos do Youtube',
        argDesc: 'nome do video'
    },


    inky: {
        commands: ['inky'],
        description: 'Gere resposta inteligente a partir de sua pergunta',
        argDesc: 'sua pergunta'
    },

    ping: {
        commands: ['ping'],
        description: 'Veja o meu tempo de resposta'
    }
};

module.exports = { botCommands };