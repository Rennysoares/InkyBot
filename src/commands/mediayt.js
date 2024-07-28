//imports
import ytsearch from 'yt-search';
import ytcore from "ytdl-core";
import ytdl from "@distube/ytdl-core";
import { sendReaction, sendText, sendImage, sendAudio, sendVideo } from '../commands/answers.js';
import fs from "fs";

import { getBuffer } from '../utils/getBuffer.js';

export const downloadMediaYt = async (params) => {

  if (!params.args){
    let text = "Você acha que eu sou vidente?🤨 Uitilize o comando com o nome do vídeo do youtube para baixar"
    await sendText(params.sock, params.messageFrom, text, params.messageReceived)
    return
  }
  const randomId = `${Math.random().toString(36).substring(2, 10)}`;

  const mediaTypes = {
    play_video: "mp4",
    play_audio: "mp3"
  };

  try {

    await sendReaction(params.sock, params.messageFrom, '🔎', params.messageReceived);
    const response = await ytsearch(params.args).catch(async () => {
      let text = "Ocorreu um erro ao pesquisar a mídia. Tente novamente"
      await sendText(params.sock, params.messageFrom, text, params.messageReceived)
    });
    const video = response.videos[0]
    const titleVideo = video.title
    const durationVideo = video.timestamp
    const durationSeconds = video.seconds;
    const canalVideo = video.author.name
    const videoUrl = video.url;

    let text = (stats) => {
      return (
`Informações do vídeo encontrado: 
Título: *${titleVideo}*
Duração: *${durationVideo}*
Canal: *${canalVideo}*
Status: *${stats}*`
      )
    }

    const thumb = await getBuffer(video.thumbnail);
    const filePath = `./src/temp/file_${randomId}.${mediaTypes[params.command]}`;
    const filePathImage = `./src/temp/thumb_${randomId}.png`;

    fs.writeFileSync(filePathImage, thumb);

    const imageInstance = await sendImage(params.sock, params.messageFrom, thumb, text('baixando ⌛'), params.messageReceived);

    if (durationSeconds > 1800) {
      new Promise(resolve => setTimeout(resolve, 2000));
      await params.sock.sendMessage(params.messageFrom, {
        image: imageInstance.message.imageMessage.mediaKey,
        caption: text('O video tem mais de 30 minutos ❌'),
        edit: imageInstance.key
      });
      fs.unlinkSync(filePathImage);
      return
    }

    fs.unlinkSync(filePathImage);

    await sendReaction(params.sock, params.messageFrom, '', params.messageReceived);

    const downloadMedia = async () => {
      const videoStream = ytdl(videoUrl, { filter: "audioandvideo" });
     
      {
        videoStream.on("info", () => {

          const videoWriteStream = fs.createWriteStream(filePath);
          videoStream.pipe(videoWriteStream);

          videoWriteStream.on("finish", async () => {

            await params.sock.sendMessage(params.messageFrom, {
              image: imageInstance.message.imageMessage.mediaKey,
              caption: text('enviando📤'),
              edit: imageInstance.key
            });

            if (params.command === "play_video") {
              await sendVideo(params.sock, params.messageFrom, { url: filePath }, params.messageReceived);
            } else if (params.command === "play_audio") {
              await sendAudio(params.sock, params.messageFrom, filePath, params.messageReceived);
            }

            await params.sock.sendMessage(params.messageFrom, {
              image: imageInstance.message.imageMessage.mediaKey,
              caption: text('enviado ✅'),
              edit: imageInstance.key
            });

            fs.unlinkSync(filePath);
          });
        })
      }
    }

    await downloadMedia();
  } catch (error) {
    await sendReaction(params.sock, params.messageFrom, '', params.messageReceived)
    let text = "Ocorreu um erro ao baixar a mídia. Tente novamente"
    await sendText(params.sock, params.messageFrom, text, params.messageReceived)
    console.error(error)
  }
}
