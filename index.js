
const { 
    makeWASocket,
    useMultiFileAuthState,
    downloadMediaMessage,
    downloadContentFromMessage
} = require('@whiskeysockets/baileys');

const pino = require('pino');
const { promisify } = require("util");
const fs = require('fs');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);
const execAsync = promisify(require("child_process").exec);

async function connectInky(){

    const auth = await useMultiFileAuthState("session");

    const socket = makeWASocket({
        printQRInTerminal: true,
        browser: ["InkyBot", "", ""], 
        auth: auth.state,
        logger: pino({ level: "silent" }),
    })

    socket.ev.on("creds.update", auth.saveCreds);
    socket.ev.on("connection.update", async ({ connection }) => {
        if (connection === "open"){
            console.log("Bot connected")
        } else if (connection === "close"){
            await connectInky();
        }
    })

    socket.ev.on("messages.upsert", async ({messages, type}) => {

        const chat = messages[0];
        const messageFrom = chat.key.remoteJid;
        const pushName = chat?.pushName || "";
        console.log(messages)
        const messageType = chat.message ? Object.keys(chat.message)[0] : null;

        console.log(messageType)

        function getMediaMessageContent(messageInfo, messageType) {
            const mediaQuoted = messageInfo.message.extendedTextMessage?.contextInfo?.quotedMessage;
          
            if (mediaQuoted) {
              return (
                mediaQuoted.imageMessage ||
                mediaQuoted.videoMessage ||
                mediaQuoted.stickerMessage
              );
            }
          
            return messageInfo.message[messageType];
        
        }

        const getFileBufferFromWhatsapp = async (mediaKey, mediaType) => {
            const stream = await downloadContentFromMessage(mediaKey, mediaType);
            const chunks = [];
          
            for await (const chunk of stream) {
              chunks.push(chunk);
            }
          
            return Buffer.concat(chunks);
          };

        const mediaMessage = getMediaMessageContent(chat, messageType);

        const capture = (
            chat.message?.extendedTextMessage?.text ??
            chat.message?.ephemeralMessage?.message?.extendedTextMessage?.text ??
            chat.message?.conversation
        ).toLowerCase() || "";

        const captureImage = (chat.message.imageMessage)

        if (capture == '.menu'){
            const dataAtual = new Date();
            const dataFormatada = dataAtual.toLocaleDateString();
            const horas= dataAtual.getHours();
            const minutos = dataAtual.getMinutes();
            const segundos = dataAtual.getSeconds();
            userName = chat.pushName
            prefix = '.'
            await socket.sendMessage(
                messageFrom,
                {
                    text:
`
╔══════════════ 
│ Inky Bot (beta)
│ Usuário: ${userName} 
│ Data: ${dataFormatada} 
│ Hora: ${horas}:${minutos}
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
                },
                { 
                    quoted: chat
                }
            );
        }
        if (capture == '.criador'){
            await socket.sendMessage(
                messageFrom,
                {
                    text: 'Criador do Inky: Renny Soares \nNúmero do criador: (92)99505-9178'
                },
                { 
                    quoted: chat
                }
            );
        }
        if (capture == '.github'){
            await socket.sendMessage(
                messageFrom,
                {
                    text: 'Por enquando o projeto não está open-source'
                },
                { 
                    quoted: chat
                }
            );
        }
        if (captureImage && chat.message.imageMessage.caption == ".sticker"){
            console.log("IMAGEM DETECTADA")
            console.log("Downloading...")
            const buffer = await downloadMediaMessage(chat, "buffer", {}, {logger: pino});
            console.log("Buffering...")
            fs.writeFileSync("./sticker.png", buffer);

            const createSticker = () => {
                
                return new Promise ((resolve, reject) => {
                    ffmpeg("./sticker.png")
                    .format("webp")
                    .size("?x320")
                    .keepDAR()
                    .autoPad("#00ffffff")
                    .on("error", (err) => reject(err))
                    .on("end", ()=> resolve("./sticker.webp"))
                    .save("./sticker.webp")
                })

            }
            console.log("Creating Sticker...")
            const sticker = await createSticker();
            console.log("Sending Sticker...")
            await socket.sendMessage(
                chat.key.remoteJid,
                {
                    sticker: {
                        url: sticker
                    }
                },
                { 
                    quoted: chat
                }
            );

            ["./sticker.png", "./sticker.webp"].forEach((fileName)=>{fs.rmSync(fileName)})
            console.log("Sucessfull")
        }
        if (capture == ".sticker"){
            if(chat.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage || chat.message?.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage){

                mediaType = "seconds" in mediaMessage ? "video" : "image";
                if (mediaType == "video" && mediaMessage.seconds > 10) {
                    console.log('Video muito longo')
                    return 
                  }
                
                if (mediaType == "video"){
                    console.log("VIDEO DETECTADO")
                    console.log("Downloading...")
                    const buffer = await getFileBufferFromWhatsapp(mediaMessage, mediaType);
                    console.log("Buffering...")
                    fs.writeFileSync("./sticker.mp4", buffer);

                    const createSticker = () => {
                        
                        return new Promise ((resolve, reject) => {
                            ffmpeg("./sticker.mp4")
                            .format("webp")
                            .size("200x200")
                            .noAudio()
                            .fps(10)
                            .on("error", (err) => reject(err))
                            .on("end", ()=> resolve("./sticker.webp"))
                            .save("./sticker.webp")
                        })

                    }
                    console.log("Creating Sticker...")
                    const sticker = await createSticker();
                    
                    await socket.sendMessage(
                        chat.key.remoteJid,
                        {
                            sticker: {
                                url: sticker
                            }
                        },
                        { 
                            quoted: chat
                        }
                    );

                    ["./sticker.mp4", "./sticker.webp"].forEach((fileName)=>{fs.rmSync(fileName)})
                    console.log("Sucessfull")
                }
                if (mediaType == "image"){
                    console.log("IMAGEM DETECTADA")
                    console.log("Downloading...")
                    const buffer = await getFileBufferFromWhatsapp(mediaMessage, mediaType);
                    console.log("Buffering...")
                    fs.writeFileSync("./sticker.png", buffer);

                    const createSticker = () => {
                        
                        return new Promise ((resolve, reject) => {
                            ffmpeg("./sticker.png")
                            .format("webp")
                            .size("?x320")
                            .keepDAR()
                            .autoPad("#00ffffff")
                            .on("error", (err) => reject(err))
                            .on("end", ()=> resolve("./sticker.webp"))
                            .save("./sticker.webp")
                        })

                    }
                    console.log("Creating Sticker...")
                    const sticker = await createSticker();
                    console.log("Sending Sticker...")
                    await socket.sendMessage(
                        chat.key.remoteJid,
                        {
                            sticker: {
                                url: sticker
                            }
                        },
                        { 
                            quoted: chat
                        }
                    );

                    ["./sticker.png", "./sticker.webp"].forEach((fileName)=>{fs.rmSync(fileName)})
                    console.log("Sucessfull")
                }
                
            }else{
                await socket.sendMessage(
                    chat.key.remoteJid,
                    {
                        text: "Marque a mensagem que queira fazer a figurinha"
                    },
                    { 
                        quoted: chat
                    }
                );
            }
            
        }     
    })
}

connectInky();