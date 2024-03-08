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
    console.log("enviado a reação")
    console.log("aguardando a pesquisa")
    const response = await yts(videoName)
    console.log("terminado a pesquisa")
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
    console.log("obtendo a thumb por buffer")
    const thumb = await getBuffer(video.thumbnail);
    const nodeBuffer = Buffer.from(thumb);
    const randomId = `${Math.random().toString(36).substring(2, 10)}`;
    console.log("escrevendo a thumb em media")
    fs.writeFileSync(`./src/temp/media/thumb_${randomId}.png`, nodeBuffer);
    //await sendText(sock, messageFrom, text, messageReceived)
    console.log("enviando a thumb")
    await sendImage(sock, messageFrom, nodeBuffer, text, messageReceived)
    console.log("enviando a reação")
    await sendReaction(sock, messageFrom, '⌛', messageReceived)
    console.log("enviando a mensagem de 'baixando'")

    
    const messageTest = await sendText(sock, messageFrom, 'baixando, aguarde', messageReceived,)
    //Media download
    const mediaTypes = {
      play_video: "mp4",
      play_audio: "mp3"
    };

    const downloadMedia = async () => {
      console.log("obtendo video stream a partir do link da pesquisa");

      const videoStream = ytDl(videoUrl, { filter: "audioandvideo" });

      videoStream.on("info", () => {

        const filePath = `./src/temp/media/file_${randomId}.${mediaTypes[command]}`;
        console.log("escrevendo o vídeo em media")
        const videoWriteStream = fs.createWriteStream(filePath);
        
        console.log("pipe stream")
        videoStream.pipe(videoWriteStream);

        videoWriteStream.on("finish", async () => {
          console.log("finish pipe")
          if (command === "play_video") {
            console.log("processo de envio de mensagem")
            await sendReaction(sock, messageFrom, '📤', messageReceived)
            console.log("reagi")
            await sock.sendMessage(messageFrom, {
              text: "Baixado. Estamos Enviando. Aguarde... (pode demorar)",
              edit: messageTest.key
            });
            await sendText(sock, messageFrom, "Baixado. Estamos Enviando. Aguarde... (pode demorar)", messageReceived)
            console.log("mandei a mensagem de 'baixado' e estou enviando")
            await sendVideo(sock, messageFrom, { url: `./src/temp/media/file_${randomId}.${mediaTypes[command]}` }, messageReceived);
            console.log("enviado")
            await sendReaction(sock, messageFrom, '', messageReceived);
            console.log("unlinkado o arquivo de video")
            fs.unlinkSync(filePath);

          } else if (command === "play_audio") {

            const audio = () => {

              return new Promise((resolve, reject) => {
                console.log("processo de transformação em mp3 com metadata")
                ffmpeg(filePath)
                  .toFormat('mp3')
                  .audioBitrate('128k')
                  .outputOptions([
                    '-metadata', `title=${titleVideo}`,
                  ])
                  .on("error", (err) => reject(err))
                  .on("end", () => resolve(`./src/temp/media/files_${randomId}.mp3`))
                  .on('progress', (progress) => {
                    obj = JSON.stringify(progress)
                    console.log('Processing: ' + obj + '% done')
                  }
                  )
                  .save(`./src/temp/media/files_${randomId}.mp3`)
              })

            }
            await audio()
            const addmetadata = () => {

              return new Promise((resolve, reject) => {
                const mp3FilePath = `./src/temp/media/files_${randomId}.mp3`;
                const imagePath = `./src/temp/media/thumb_${randomId}.png`

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

                fs.unlinkSync(imagePath);
              })

            }
            await addmetadata();
            console.log("processo de envio")
            await sendReaction(sock, messageFrom, '📤', messageReceived)
            console.log("enviei a reação")
            await sendText(sock, messageFrom, "Baixado. Estamos Enviando. Aguarde... (pode demorar)", messageReceived)
            console.log("enviei o texto de 'baixado' e estou enviando")
            await sendAudio(sock, messageFrom, `./src/temp/media/files_${randomId}.${mediaTypes[command]}`, messageReceived);
            console.log("enviado")
            await sendReaction(sock, messageFrom, '', messageReceived)
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