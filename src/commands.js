import { menuFunc } from './commands/menu.js';
import { stickers } from './commands/stickers.js';
import { suggestion } from './commands/suggestion.js';
import { bug } from './commands/bug.js'
import { downloadMediaYt } from './commands/mediayt.js';
import { InkyIaAnswer } from './commands/iaanswers.js';
import { pingInky } from './commands/ping.js';
import { downloads } from './commands/downloads.js';
import { search } from './commands/search.js';
import { openSite } from './commands/opensite.js';

export const botCommands = {

    menu: {
        commands: ['menu', 'm'],
        description: 'Veja os principais comandos',
        help: 'Para você utilizar o comando...',
        execution: async (params) => {await menuFunc(params)},
    },

    sticker: {
        commands: ['sticker', 's', 'fsticker', 'fs'],
        formatCommands: ['fsticker', 'fs'],
        description: 'Faça figurinhas de imagens e vídeos menores do que 10 segundos',
        tip: 'Use o comando fsticker ou fs com o prefixo para a figurinha não ficar esticado',
        execution: async (params) => {await stickers(params)},
    },
    
    ping: {
        commands: ['ping'],
        description: 'Veja o meu tempo de resposta',
        execution: async (params) => { await pingInky(params) },
    },

    play_video: {
        commands: ['play_video'],
        description: 'Baixe videos do YouTube',
        argDesc: 'nome do video',
        execution: async () => { await downloadMediaYt(sock, messageFrom, args, command, messageReceived) },
    },

    play_audio: {
        commands: ['play_audio', 'play'],
        description: 'Baixe áudio de vídeos do Youtube',
        argDesc: 'nome do video',
        execution: async () => { await downloadMediaYt(sock, messageFrom, args, command, messageReceived) },
    },

    inky: {
        commands: ['inky'],
        description: 'Gere resposta inteligente a partir de sua pergunta',
        argDesc: 'sua pergunta',
        execution: async () => { await InkyIaAnswer(sock, messageFrom, args, messageReceived) },
    },

    downloadvideo: {
        commands: ['download', 'd', 'dl'],
        description: 'Aqui você pode baixar vídeos do youtube, instagram e tiktok',
        argDesc: 'link',
        execution:  async () => { await downloads(sock, messageFrom, args, messageReceived) },
    },

    search: {
        commands: ['pesquisar', 'p', 'search', 'pesquisa'],
        description: 'Aqui você pode baixar pesquisar algo no Google',
        argDesc: 'sua pesquisa',
        execution: async () => { await search(sock, messageFrom, args, messageReceived)},
    },

    openSite: {
        commands: ['site', 'abrir'],
        description: 'Aqui você pode abrir uma página a partir de um link',
        argDesc: 'link',
        execution: async () => { await openSite(sock, messageFrom, args, messageReceived)}
    },

    sugestao: {
        commands: ['sugestao'],
        description: 'Envie sugestões com este comando, assim você contribui ao meu desenvolvimento',
        argDesc: 'sua sugestão',
        execution: async () => { await suggestion(sock, messageFrom, messageReceived, args) },
    },

    bug: {
        commands: ['bug'],
        description: 'Reporte bugs percebidos, assim recorrerei ao meu desenvolvedor',
        argDesc: 'bug encontrado',
        execution: async () => { await bug(sock, messageFrom, messageReceived, args) },
    },
};

