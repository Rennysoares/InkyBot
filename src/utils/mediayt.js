//imports
const yts = require('yt-search');
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));
const { sendReaction, sendText, sendImage, sendAudio, sendVideo } = require('../utils/answers');
const fs = require("fs");
const ytDl = require("ytdl-core");
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
const NodeID3 = require('node-id3');
//functions

const getBuffer = async (url) => {
  let response = await fetch(url, {
    method: "get",
    body: null,
  });

  let media = await response.arrayBuffer();
  return media;
};

const downloadMediaYt = async (sock, messageFrom, args, command, messageReceived) => {

  //Video name
  const videoName = args

  //Search video
  try {
    await sendReaction(sock, messageFrom, '🔎', messageReceived)
    const response = await yts(videoName)
    const video = response.videos[0]

    //Atributes
    const titleVideo = video.title
    const durationVideo = video.timestamp
    const canalVideo = video.author.name
    const videoUrl = video.url;

    let text =
      `Informações do vídeo encontrado: 
Título: *${titleVideo}*
Duração: *${durationVideo}*
Canal: *${canalVideo}*`
    //Buffer Thumbnail and Send
    const thumb = await getBuffer(video.thumbnail);
    const nodeBuffer = Buffer.from(thumb);
    const randomId = `${Math.random().toString(36).substring(2, 10)}`;
    fs.writeFileSync(`./src/temp/thumb_${randomId}.png`, nodeBuffer);
    //await sendText(sock, messageFrom, text, messageReceived)
    await sendImage(sock, messageFrom, nodeBuffer, text, messageReceived)
    await sendReaction(sock, messageFrom, '⌛', messageReceived)
    await sendText(sock, messageFrom, "Baixando... Aguarde...", messageReceived)
    //Media download
    const mediaTypes = {
      play_video: "mp4",
      play_audio: "mp3"
    };

    const downloadMedia = async () => {
      const videoStream = ytDl(videoUrl, { filter: "audioandvideo" });

      videoStream.on("info", () => {

        const filePath = `./src/temp/file_${randomId}.${mediaTypes[command]}`;

        const videoWriteStream = fs.createWriteStream(filePath);
        videoStream.pipe(videoWriteStream);

        videoWriteStream.on("finish", async () => {
          if (command === "play_video") {
            await sendReaction(sock, messageFrom, '📤', messageReceived)
            await sendText(sock, messageFrom, "Baixado. Estamos Enviando. Aguarde... (pode demorar)", messageReceived)
            await sendVideo(sock, messageFrom, { url: `./src/temp/file_${randomId}.${mediaTypes[command]}` }, messageReceived);
            await sendReaction(sock, messageFrom, '', messageReceived)
            fs.unlinkSync(filePath);

          } else if (command === "play_audio") {

            const audio = () => {

              return new Promise((resolve, reject) => {
                ffmpeg(`./src/temp/file_${randomId}.${mediaTypes[command]}`)
                  .toFormat('mp3')
                  .audioBitrate('128k')
                  .outputOptions([
                    '-metadata', `artist=${canalVideo}`,
                    '-metadata', `title=${titleVideo}`,
                  ])
                  .on("error", (err) => reject(err))
                  .on("end", () => resolve(`./src/temp/file_${randomId}.${mediaTypes[command]}`))
                  /*.on('progress', (progress) => {
                    obj = JSON.stringify(progress)
                    console.log('Processing: ' + obj + '% done')
                  }
                  )*/
                  .save(`./src/temp/files_${randomId}.${mediaTypes[command]}`)
              })

            }
            await audio()
            const addmetadata = () => {

              return new Promise((resolve, reject) => {
                const mp3FilePath = `./src/temp/files_${randomId}.${mediaTypes[command]}`;
                const imagePath = `./src/temp/thumb_${randomId}.png`

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
            await addmetadata();
            await sendReaction(sock, messageFrom, '📤', messageReceived)
            await sendText(sock, messageFrom, "Baixado. Estamos Enviando. Aguarde... (pode demorar)", messageReceived)
            await sendAudio(sock, messageFrom, `./src/temp/files_${randomId}.${mediaTypes[command]}`, messageReceived);
            await sendReaction(sock, messageFrom, '', messageReceived)
            fs.unlinkSync(filePath);

          }
        });
      });
    }

    await downloadMedia();

  } catch (error) {
    await sendReaction(sock, messageFrom, '', messageReceived)
    let text = `Não foi possível encontrar seu vídeo. Tente novamente`
    await sendText(sock, messageFrom, text, messageReceived)
    console.error(error)
  }


}
module.exports = {
  downloadMediaYt
}