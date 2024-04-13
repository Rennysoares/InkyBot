//imports
const ytsearch = require('yt-search');
const ytcore = require("ytdl-core")
const axios = require('axios');
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));
const { sendReaction, sendText, sendImage, sendAudio, sendVideo } = require('../functions/answers');
const fs = require("fs");
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
const NodeID3 = require('node-id3');


const getBuffer = async (url) => {
  let response = await fetch(url, {
    method: "get",
    body: null,
  });

  let media = await response.arrayBuffer();
  const nodeBuffer = Buffer.from(media);
  return nodeBuffer;
};

const downloadMediaYt = async (sock, messageFrom, args, command, messageReceived) => {

  const videoName = args

  try {

    await sendReaction(sock, messageFrom, '🔎', messageReceived)
    const response = await ytsearch(videoName)
    const video = response.videos[0]


    const titleVideo = video.title
    const durationVideo = video.timestamp
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
    const randomId = `${Math.random().toString(36).substring(2, 10)}`;

    fs.writeFileSync(`./src/temp/thumb_${randomId}.png`, thumb);

    const imageInstance = await sendImage(sock, messageFrom, thumb, text('baixando ⌛'), messageReceived)
    await sendReaction(sock, messageFrom, '', messageReceived)

    //Media download
    const mediaTypes = {
      play_video: "mp4",
      play_audio: "mp3"
    };

    const downloadMedia = async () => {

      const videoStream = ytcore(videoUrl, { filter: "audioandvideo" });

      videoStream.on("info", () => {
        const randomId = `${Math.random().toString(36).substring(2, 10)}`;
        const filePath = `./src/temp/file_${randomId}.${mediaTypes[command]}`;

        const videoWriteStream = fs.createWriteStream(filePath);
        videoStream.pipe(videoWriteStream);

        videoWriteStream.on("finish", async () => {
          if (command === "play_video") {
            await sock.sendMessage(messageFrom, {
              image: imageInstance.message.imageMessage.mediaKey,
              caption: text('enviando📤'),
              edit: imageInstance.key
            });
            await sendVideo(sock, messageFrom, {url: filePath}, messageReceived);
            await sock.sendMessage(messageFrom, {
              image: imageInstance.message.imageMessage.mediaKey,
              caption: text('enviado ✅'),
              edit: imageInstance.key
            });
            fs.unlinkSync(filePath);
          } else if (command === "play_audio") {
            await sock.sendMessage(messageFrom, {
              image: imageInstance.message.imageMessage.mediaKey,
              caption: text('enviando📤'),
              edit: imageInstance.key
            });
            await sendAudio(sock, messageFrom, filePath, messageReceived);
            await sock.sendMessage(messageFrom, {
              image: imageInstance.message.imageMessage.mediaKey,
              caption: text('enviado ✅'),
              edit: imageInstance.key
            });
            fs.unlinkSync(filePath);
          }
        });
      });

      /*
      const video = command === "play_video" ? await data.video['360p'].download() : await data.audio['128kbps'].download()
      const gettedBuffer = await getBuffer(video);
      fs.writeFileSync(filePath, gettedBuffer)
      const videoDownloaded = fs.readFileSync(filePath)

      */

      /**
       * Aqui fica o breakpoint
       */

      return

      if (command === "play_video") {
        await sock.sendMessage(messageFrom, {
          image: imageInstance.message.imageMessage.mediaKey,
          caption: text('enviando📤'),
          edit: imageInstance.key
        });
        await sendVideo(sock, messageFrom, videoDownloaded, messageReceived);
        await sock.sendMessage(messageFrom, {
          image: imageInstance.message.imageMessage.mediaKey,
          caption: text('enviado ✅'),
          edit: imageInstance.key
        });
        await sendReaction(sock, messageFrom, '', messageReceived);
        fs.unlinkSync(filePath);
        fs.unlinkSync(`./src/temp/thumb_${randomId}.png`);
      } else if (command === "play_audio") {

        const mp3FilePath = `./src/temp/files_${randomId}.mp3`;
        const imagePath = `./src/temp/thumb_${randomId}.png`;

        const audio = () => {

          return new Promise((resolve, reject) => {
            ffmpeg(filePath)
              .toFormat('mp3')
              .outputOptions([
                '-metadata', `title=${titleVideo}`,
              ])
              .on("error", (err) => reject(err))
              .on("end", () => resolve(mp3FilePath))
              .save(mp3FilePath)
          })

        }
        await sock.sendMessage(messageFrom, {
          image: imageInstance.message.imageMessage.mediaKey,
          caption: text('transformando 🎚️'),
          edit: imageInstance.key
        });
        await audio()
        const addmetadata = () => {

          return new Promise((resolve, reject) => {

            // Lendo o arquivo de imagem
            const imageBuffer = fs.readFileSync(imagePath);

            // Lendo os metadados atuais do arquivo MP3
            const tags = NodeID3.read(mp3FilePath);

            // Adicionando a imagem aos metadados
            tags.image = {
              mime: 'image/png',
              type: { id: 3, name: 'front cover' },
              description: 'Capa do álbum',
              imageBuffer: imageBuffer
            };
            tags.title = titleVideo;
            tags.artist = canalVideo;
            tags.album = canalVideo;
            // Escrevendo os novos metadados no arquivo MP3
            const success = NodeID3.write(tags, mp3FilePath);

            if (success) {
              resolve(mp3FilePath)
            } else {
              reject(console.error('Falha ao adicionar imagem ao arquivo MP3.'))
            }
          })

        }
        await sock.sendMessage(messageFrom, {
          image: imageInstance.message.imageMessage.mediaKey,
          caption: text('adicionando metadata 🔏'),
          edit: imageInstance.key
        });
        await addmetadata();
        await sock.sendMessage(messageFrom, {
          image: imageInstance.message.imageMessage.mediaKey,
          caption: text('enviando 📤'),
          edit: imageInstance.key
        });
        //await sendText(sock, messageFrom, "Baixado. Estamos Enviando. Aguarde... (pode demorar)", messageReceived)
        await sendAudio(sock, messageFrom, `./src/temp/files_${randomId}.${mediaTypes[command]}`, messageReceived);
        await sock.sendMessage(messageFrom, {
          image: imageInstance.message.imageMessage.mediaKey,
          caption: text('enviado ✅'),
          edit: imageInstance.key
        });
        fs.unlinkSync(filePath);
        fs.unlinkSync(mp3FilePath);
        fs.unlinkSync(imagePath);

        /*
        await sock.sendMessage(messageFrom, {
          image: imageInstance.message.imageMessage.mediaKey,
          caption: text('enviando📤'),
          edit: imageInstance.key
        });
        await sock.sendMessage(messageFrom, 
          { 
            audio: { 
              url: filePath 
            },
            mimetype: "audio/mp4"
          }, 
          { messageReceived }
        )
        await sock.sendMessage(messageFrom, {
          image: imageInstance.message.imageMessage.mediaKey,
          caption: text('enviado ✅'),
          edit: imageInstance.key
        });
        */

      }

    }

    await downloadMedia();

  } catch (error) {
    await sendReaction(sock, messageFrom, '', messageReceived)
    let text = "Ocorreu um erro ao baixar a mídia. Tente novamente"
    await sendText(sock, messageFrom, text, messageReceived)
    console.error(error)
  }


}
module.exports = {
  downloadMediaYt
}