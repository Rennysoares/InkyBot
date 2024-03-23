const Jimp = require('jimp');
const ping = require('ping');
const fs = require('fs');
const { sendImage, sendReaction, sendText } = require('./answers')
// Carrega a imagem

async function pingInky(sock, messageFrom, quoted) {
    await sendReaction(sock, messageFrom, '⌛', quoted)
    try {

        const randomId = `${Math.random().toString(36).substring(2, 10)}`;
        const filePathOut = `./src/temp/ping_${randomId}.png`;

        let pingRes = '';
        // Endereço IP ou nome de host para pingar
        const host = 'www.google.com';
        // Executa o ping
        await ping.promise.probe(host)
            .then(function (res) {
                pingRes = '' + res.time + 'ms'
            })
            .catch(function (err) {
                console.error('Erro ao executar o ping:', err);
            });
        if (!pingRes) throw new Error('Ping não achado')
        async function addTextToImage() {
            try {
                const [font1, font2, font3] = await Promise.all([
                    Jimp.loadFont(Jimp.FONT_SANS_32_WHITE), // Fonte para o primeiro texto
                    Jimp.loadFont(Jimp.FONT_SANS_128_WHITE),  // Fonte para o segundo texto
                    Jimp.loadFont(Jimp.FONT_SANS_32_WHITE)
                ]);

                // Carrega a imagem
                const image = await Jimp.read('./src/assets/banner.jpeg');

                const text1 = "Ping";
                const text2 = pingRes;
                const text3 = "Inky Bot © - Solicitado por " + quoted.pushName

                // Obtém a largura e altura da imagem
                const imageWidth = image.bitmap.width;
                const imageHeight = image.bitmap.height;

                // Obtém a largura e altura dos textos
                const text1Width = Jimp.measureText(font1, text1);
                const text2Width = Jimp.measureText(font2, text2);
                const textHeight1 = Jimp.measureTextHeight(font1, text1);
                const textHeight2 = Jimp.measureTextHeight(font2, text2);
                const textHeight3 = Jimp.measureTextHeight(font3, text3);
                const textWidth3 = Jimp.measureText(font3, text3);


                // Calcula as coordenadas para o canto inferior direito


                // Calcula as coordenadas para centralizar os textos
                const x1 = (imageWidth - text1Width) / 2;
                const x2 = (imageWidth - text2Width) / 2;
                const y1 = (imageHeight - (textHeight1 + textHeight2)) / 2; // Espaço para dois textos
                const y2 = y1 + textHeight1; // Posição do segundo texto
                const x3 = imageWidth - textWidth3 - 10; // 10 pixels de margem
                const y3 = imageHeight - textHeight3 - 10; // 10 pixels de margem

                // Adiciona o primeiro texto à imagem
                image.print(
                    font1,             // Fonte
                    x1, y1,          // Posição (x, y)
                    text1            // Texto
                );

                // Adiciona o segundo texto à imagem
                image.print(
                    font2,             // Fonte
                    x2, y2,          // Posição (x, y)
                    text2            // Texto
                );

                image.print(
                    font3,             // Fonte
                    x3, y3,          // Posição (x, y)
                    text3            // Texto
                );


                // Salva a imagem com os textos adicionados
                await image.writeAsync(filePathOut);
            } catch (err) {
                console.error(err);
            }
        }
        await addTextToImage() /
            await sendImage(sock, messageFrom, { url: filePathOut }, "Ping do host é " + pingRes, quoted)
        await sendReaction(sock, messageFrom, '', quoted)
        fs.unlinkSync(filePathOut);
    } catch (e) {
        await sendReaction(sock, messageFrom, '', quoted)
        await sendText(sock, messageFrom, 'Não foi possível gerar o ping :(', quoted)
        console.log(e)
    }

}

module.exports = { pingInky }

