const axios = require('axios');
const fs = require('fs');
const imageType = require('image-type');
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));
const { youtubedl, tiktokdl } = require('@bochilteam/scraper-sosmed');
const { snapsave, savefrom } = require('@bochilteam/scraper');
const { sendText, sendReaction, sendVideo, sendImage } = require("./answers");

function isImage(buffer) {
    const type = imageType(buffer);
    return type !== null;
}

const getBuffer = async (url) => {
    let response = await fetch(url, {
      method: "get",
      body: null,
    });
  
    let media = await response.arrayBuffer();
    const nodeBuffer = Buffer.from(media);
    return nodeBuffer;
  };
  

async function fromYoutube(link, sock, messageFrom, messageReceived) {
    try {
        const data = await youtubedl(link);
        const video = await data.video['360p'].download();
        const gettedBuffer = await getBuffer(video)
        fs.writeFileSync('./src/temp/media/video.mp4', gettedBuffer)
        const videoDownloaded = fs.readFileSync('./src/temp/media/video.mp4')
        await sendVideo(sock, messageFrom, videoDownloaded, messageReceived);
    } catch (error) {
        text = 'Ocorreu um erro no download do link. Tente novamente'
        await sendText(sock, messageFrom, text, messageReceived)
        console.error("Erro em relação ao download:", error);
        return null;
    }

}

async function fromInstagram(link, sock, messageFrom, messageReceived) {
    try {
        const data = await snapsave(link);
        console.log(data[0].url)
        const gettedBuffer = await getBuffer(data[0].url)
        fs.writeFileSync('./src/temp/media/video.mp4', gettedBuffer)
        const videoDownloaded = fs.readFileSync('./src/temp/media/video.mp4');
        isImage(gettedBuffer) ?
            await sendImage(sock, messageFrom, videoDownloaded, "", messageReceived) :
            await sendVideo(sock, messageFrom, videoDownloaded, messageReceived)
    } catch (error) {
        text = 'Ocorreu um erro no download do link. Tente novamente'
        await sendText(sock, messageFrom, text, messageReceived)
        console.error("Erro em relação ao download:", error);
        return null;
    }
}

async function fromTikTok(link, sock, messageFrom, messageReceived) {
    try {
        const data = await tiktokdl(link)
        const gettedBuffer = await getBuffer(data.video.no_watermark)
        fs.writeFileSync('./src/temp/media/video.mp4', gettedBuffer)
        const videoDownloaded = fs.readFileSync('./src/temp/media/video.mp4')
        await sendVideo(sock, messageFrom, videoDownloaded, messageReceived);
    } catch (error) {
        text = 'Ocorreu um erro no download do link. Tente novamente'
        await sendText(sock, messageFrom, text, messageReceived)
        console.error("Erro em relação ao download:", error);
        return null;
    }
}

async function fromFacebook(link, sock, messageFrom, messageReceived) {
    try {
        const data = await savefrom(link)
        console.log(data)
    } catch (error) {
        text = 'Ocorreu um erro no download do link. Tente novamente'
        await sendText(sock, messageFrom, text, messageReceived)
        console.error("Erro em relação ao download:", error);
        return null;
    }
}

async function downloads(sock, messageFrom, args, messageReceived) {

    if (args.length == 0) {
        text = `Sou um bot, não um advinhador de links ;-;`
        await sendText(sock, messageFrom, text, messageReceived)
        return
    }

    let link = args;

    const suportLinks = {
        'www.instagram.com': {
            plataform: 'instagram',
            execFunc: async () => { await fromInstagram(args, sock, messageFrom, messageReceived) }
        },
        'youtu.be': {
            plataform: 'youtube',
            execFunc: async () => { await fromYoutube(args, sock, messageFrom, messageReceived) }
        },
        'vm.tiktok.com': {
            plataform: 'tiktok',
            execFunc: async () => { await fromTikTok(args, sock, messageFrom, messageReceived) }
        },

    }

    if (!link.match(/^https?:\/\/.+/)) {
        text = `Verifique se inseriu o link corretamente (link inválido)`
        await sendText(sock, messageFrom, text, messageReceived)
        return;
    }

    try {
        const url = new URL(link);
        const hostname = url.hostname;
        if (suportLinks[hostname]) {
            await sendReaction(sock, messageFrom, '⌛', messageReceived)
            await suportLinks[hostname].execFunc();
            await sendReaction(sock, messageFrom, '', messageReceived)
        } else {
            await sendReaction(sock, messageFrom, '', messageReceived)
            console.log('Link não suportado no momento')
        }

    } catch (error) {
        await sendReaction(sock, messageFrom, '', messageReceived)
        text = 'Ocorreu um erro no processamento do link. Tente novamente'
        await sendText(sock, messageFrom, text, messageReceived)
        console.error("Erro em relação ao processamento:", error);
    }
}

module.exports = { downloads }






