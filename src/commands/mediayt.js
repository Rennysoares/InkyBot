//imports
import ytsearch from 'yt-search';
import ytcore from "ytdl-core";
import { sendReaction, sendText, sendImage, sendAudio, sendVideo } from '../commands/answers.js';
import fs from "fs";
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

const getBuffer = async (url) => {
  let response = await fetch(url, {
    method: "get",
    body: null,
  });

  let media = await response.arrayBuffer();
  const nodeBuffer = Buffer.from(media);
  return nodeBuffer;
};

export const downloadMediaYt = async (sock, messageFrom, args, command, messageReceived) => {

  const randomId = `${Math.random().toString(36).substring(2, 10)}`;
  
  const mediaTypes = {
    play_video: "mp4",
    play_audio: "mp3"
  };

  try {

    await sendReaction(sock, messageFrom, '🔎', messageReceived);

    const response = await ytsearch(args).catch(()=>{
      //TODO: send message of error
    })
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
    const filePath = `./src/temp/file_${randomId}.${mediaTypes[command]}`;
    const filePathImage = `./src/temp/thumb_${randomId}.png`;

    fs.writeFileSync(filePathImage, thumb);
  
    const imageInstance = await sendImage(sock, messageFrom, thumb, text('baixando ⌛'), messageReceived);

    if (durationSeconds > 1800){
      new Promise(resolve => setTimeout(resolve, 2000));
      await sock.sendMessage(messageFrom, {
        image: imageInstance.message.imageMessage.mediaKey,
        caption: text('O video tem mais de 30 minutos ❌'),
        edit: imageInstance.key
      });
      fs.unlinkSync(filePathImage);
      return
    }

    fs.unlinkSync(filePathImage);

    await sendReaction(sock, messageFrom, '', messageReceived);

    const downloadMedia = async () => {

      const videoStream = ytcore(videoUrl, { filter: "audioandvideo" });

      videoStream.on("info", () => {

        const videoWriteStream = fs.createWriteStream(filePath);
        videoStream.pipe(videoWriteStream);

        videoWriteStream.on("finish", async () => {

          await sock.sendMessage(messageFrom, {
            image: imageInstance.message.imageMessage.mediaKey,
            caption: text('enviando📤'),
            edit: imageInstance.key
          });

          if (command === "play_video") {
            await sendVideo(sock, messageFrom, {url: filePath}, messageReceived);
          } else if (command === "play_audio") {
            await sendAudio(sock, messageFrom, filePath, messageReceived);
          }

          await sock.sendMessage(messageFrom, {
            image: imageInstance.message.imageMessage.mediaKey,
            caption: text('enviado ✅'),
            edit: imageInstance.key
          });
          
          fs.unlinkSync(filePath);
        });
      });
    }

    await downloadMedia();

  } catch (error) {
    await sendReaction(sock, messageFrom, '', messageReceived)
    let text = "Ocorreu um erro ao baixar a mídia. Tente novamente"
    await sendText(sock, messageFrom, text, messageReceived)
    console.error(error)
  }
}
