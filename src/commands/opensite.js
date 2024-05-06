import scrape from 'website-scraper';
import archiver from 'archiver';
import fs from 'fs';
import path from 'path';

export async function openSite(sock, messageFrom, args, messageReceived) {
    
    await sock.sendMessage(messageFrom, { react: { text: "🔎", key: messageReceived.key } })

    const caminhoDoArquivo = './src/temp/site.zip';
    const pastaParaApagar = './src/temp/site';

    function deleteFolder(dir) {
        if (fs.existsSync(dir)) {
            fs.readdirSync(dir).forEach((arquivo, index) => {
                const archPath = path.join(dir, arquivo);
                if (fs.lstatSync(archPath).isDirectory()) {
                    deleteFolder(archPath);
                } else {
                    fs.unlinkSync(archPath);
                }
            });
            fs.rmdirSync(dir);
            console.log(`${dir} deletada!`);
        } else {
            console.log(`${dir} não existe.`);
        }
    }

    deleteFolder(pastaParaApagar);

    function apagarZIP(caminhoDoArquivo){
        if (fs.existsSync(caminhoDoArquivo)) {
            // Apaga o arquivo
            fs.unlinkSync(caminhoDoArquivo);
            console.log(`O arquivo ${caminhoDoArquivo} foi apagado com sucesso.`);
        } else {
            console.log(`O arquivo ${caminhoDoArquivo} não existe.`);
        }
    }

    apagarZIP(caminhoDoArquivo);

    if (!args){
        await sock.sendMessage(
            messageFrom,
            {
                text: 'Nunca vi abrir um site sem o link. Use o comando com o link que deseja abrir'
            },
            {
                messageReceived
            }
        );
        return
    }
    try {
        const options = {
            urls: [args],
            directory: './src/temp/site',
            request: {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Linux; Android 4.2.1; en-us; Nexus 4 Build/JOP40D) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.166 Mobile Safari/535.19'
                }
            },
            sources: [
                {selector: 'img', attr: 'src'},
                {selector: 'link[rel="stylesheet"]', attr: 'href'},
                {selector: 'script', attr: 'src'}
              ]
        };

        // with async/await
        const result = await scrape(options);

        async function compactPaste(pastaParaCompactar, saidaZip) {
            return new Promise((resolve, reject) => {
                const zip = archiver('zip', { zlib: { level: 9 } });

                // Stream de saída para o arquivo zip
                const saidaStream = fs.createWriteStream(saidaZip);

                // Evento de erro
                saidaStream.on('error', reject);

                // Evento de conclusão
                saidaStream.on('close', () => {
                    console.log('Compactação concluída com sucesso!');
                    resolve();
                });

                // Conecta o stream de saída ao Archiver
                zip.pipe(saidaStream);

                // Adiciona a pasta ao arquivo zip
                zip.directory(pastaParaCompactar, false);

                // Finaliza o arquivo zip
                zip.finalize();
            });
        }

        const pastaParaCompactar = './src/temp/site';
        const saidaZip = './src/temp/site.zip';

        await compactPaste(pastaParaCompactar, saidaZip)
            .then(() => {
                console.log('Compactação concluída!');
            })
            .catch((err) => {
                console.error('Erro ao compactar:', err);
            });

        await sock.sendMessage(messageFrom, { document: { url: './src/temp/site.zip' }, mimetype: 'application/zip', fileName: 'site.zip', caption: 'O site está no arquivo index.html\nO site pode não abrir\nO site poderá ficar desestruturado\nBoa sorte'}, { messageReceived })
        await sock.sendMessage(messageFrom, { react: { text: "", key: messageReceived.key } })
        deleteFolder(pastaParaApagar);
        apagarZIP(caminhoDoArquivo);
    } catch (e){
        await sock.sendMessage(messageFrom, { react: { text: "", key: messageReceived.key } })
        console.error(e)
        await sock.sendMessage(
            messageFrom,
            {
                text: 'Ocorreu um erro. Provavelmente o link é inválido ou o site possui barreiras de segurança. Tente novamente'
            },
            {
                messageReceived
            }
        );
    }

}

