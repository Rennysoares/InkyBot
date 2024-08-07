import axios from 'axios';
import fs from 'fs';
import imageType from 'image-type';
const fetch = (...args) =>
    import('node-fetch').then(({ default: fetch }) => fetch(...args));
import ytdl from "@distube/ytdl-core";
import { youtubedl, tiktokdl } from '@bochilteam/scraper-sosmed';
import { snapsave, savefrom } from '@bochilteam/scraper';
import { sendText, sendReaction, sendVideo, sendImage } from "./answers.js";


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
        return new Promise((resolve, reject) => {
            try {
                const videoStream = ytdl(link, { filter: "audioandvideo" });
                videoStream.on("info", () => {
                    const randomId = `${Math.random().toString(36).substring(2, 10)}`;
                    const filePath = `./src/temp/file_${randomId}.mp4`;

                    const videoWriteStream = fs.createWriteStream(filePath);
                    videoStream.pipe(videoWriteStream);

                    videoWriteStream.on("finish", async () => {
                        await sendVideo(sock, messageFrom, { url: filePath }, messageReceived);
                        fs.unlinkSync(filePath);
                        resolve("finished");
                    })

                    //fs.unlinkSync(`./src/temp/thumb_${randomId}.png`);

                });
            } catch(e){
                reject(e);
            }
            
        })
    } catch (error) {
        const text = 'Ocorreu um erro no download do link. Tente novamente'
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
        fs.writeFileSync('./src/temp/video.mp4', gettedBuffer)
        const videoDownloaded = fs.readFileSync('./src/temp/video.mp4');
        isImage(gettedBuffer) ?
            await sendImage(sock, messageFrom, videoDownloaded, "", messageReceived) :
            await sendVideo(sock, messageFrom, videoDownloaded, messageReceived)
        fs.unlinkSync('./src/temp/video.mp4');
    } catch (error) {
        const text = 'Ocorreu um erro no download do link. Tente novamente'
        await sendText(sock, messageFrom, text, messageReceived)
        console.error("Erro em relação ao download:", error);
        return null;
    }
}

async function fromTikTok(link, sock, messageFrom, messageReceived) {
    try {
        const data = await tiktokdl(link)
        const gettedBuffer = await getBuffer(data.video.no_watermark)
        fs.writeFileSync('./src/temp/video.mp4', gettedBuffer)
        const videoDownloaded = fs.readFileSync('./src/temp/video.mp4')
        await sendVideo(sock, messageFrom, videoDownloaded, messageReceived);
        fs.unlinkSync('./src/temp/video.mp4');
    } catch (error) {
        const text = 'Ocorreu um erro no download do link. Tente novamente'
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
        const text = 'Ocorreu um erro no download do link. Tente novamente'
        await sendText(sock, messageFrom, text, messageReceived)
        console.error("Erro em relação ao download:", error);
        return null;
    }
}

export async function downloads(params, messageReceived) {

    if (!params.args) {
        const text = `Não esqueça do link`
        await sendText(params.sock, params.messageFrom, text, params.messageReceived)
        return
    }

    let link = params.args;

    const suportLinks = {
        'www.instagram.com': {
            plataform: 'instagram',
            execFunc: async () => { await fromInstagram(params.args, params.sock, params.messageFrom, params.messageReceived) }
        },
        'youtu.be': {
            plataform: 'youtube',
            execFunc: async () => { await fromYoutube(params.args, params.sock, params.messageFrom, params.messageReceived) }
        },
        'vm.tiktok.com': {
            plataform: 'tiktok',
            execFunc: async () => { await fromTikTok(params.args, params.sock, params.messageFrom, params.messageReceived) }
        },

    }

    if (!link.match(/^https?:\/\/.+/)) {
        const text = `Verifique se inseriu o link corretamente (link inválido)`
        await sendText(params.sock, params.messageFrom, text, params.messageReceived)
        return;
    }

    try {
        const url = new URL(link);
        const hostname = url.hostname;
        if (suportLinks[hostname]) {
            await sendReaction(params.sock, params.messageFrom, '⌛', params.messageReceived)
            await suportLinks[hostname].execFunc();
            await sendReaction(params.sock, params.messageFrom, '', params.messageReceived)
        } else {
            await sendReaction(params.sock, params.messageFrom, '', params.messageReceived)
            console.log('Link não suportado no momento')
        }

    } catch (error) {
        await sendReaction(params.sock, params.messageFrom, '', params.messageReceived)
        const text = 'Ocorreu um erro no processamento do link. Tente novamente'
        await sendText(params.sock, params.messageFrom, text, params.messageReceived)
        console.error("Erro em relação ao processamento:", error);
    }
}








