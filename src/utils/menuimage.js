import Jimp from 'jimp';
import fs from 'fs';

export const getBuffer = async (url) => {
  let response = await fetch(url, {
    method: "get",
    body: null,
  });

  let media = await response.arrayBuffer();
  const nodeBuffer = Buffer.from(media);
  return nodeBuffer;
};

async function criarMascaraCircular(width, height) {
  const mask = new Jimp(width, height, 0x00000000);

  const raio = Math.min(width, height) / 2;
  mask.scan(0, 0, width, height, (x, y, idx) => {
    const distCenter = Math.sqrt((x - width / 2) ** 2 + (y - height / 2) ** 2);
    if (distCenter <= raio) {
      mask.setPixelColor(0xFFFFFFFF, x, y);
    }
  });

  return mask;
}

async function addText(image, text) {
  const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
  const textWidth = Jimp.measureText(font, text);
  const textHeight = Jimp.measureTextHeight(font, text);

  // Calcular a posição do texto
  const x = (image.bitmap.width - textWidth) / 2;
  const y = image.bitmap.height - textHeight - 10; // 10 pixels de margem do fundo

  // Adicionar o texto à imagem
  image.print(font, x, y, text);

  return image;
}
export async function getProfilePicture(params){
  try{
    const randomId = `${Math.random().toString(36).substring(2, 10)}`;
    const filePathImage = `./src/temp/picture_${randomId}.png`;
    const ppUrl = await params.sock.profilePictureUrl(params.idUser, 'image');
    let bufferpicture = await getBuffer(ppUrl);
    fs.writeFileSync(filePathImage, bufferpicture);
    return filePathImage
  }catch{
    return './src/assets/inky.jpg'
  }
}

export async function menuimage(params, hour, minute, second, formDate) {
  try {
    const randomId = `${Math.random().toString(36).substring(2, 10)}`;
    let filepicture = await getProfilePicture(params)

    // Carregue as duas imagens
    const imagemFundo = await Jimp.read('./src/assets/backgroundmenu.jpg');
    const imagemCentral = await Jimp.read(filepicture);

    // Defina o fator de escala desejado para a imagem central
    const escala = 0.5; // Ajuste este valor conforme necessário

    // Calcular novas dimensões para a imagem central
    const larguraCentral = imagemCentral.bitmap.width * escala;
    const alturaCentral = imagemCentral.bitmap.height * escala;

    // Redimensionar a imagem central
    imagemCentral.resize(larguraCentral, alturaCentral);

    // Cria a máscara circular com as novas dimensões
    const mascaraCircular = await criarMascaraCircular(larguraCentral, alturaCentral);

    // Aplica a máscara à imagem central
    imagemCentral.mask(mascaraCircular);

    const larguraFundo = imagemFundo.bitmap.width;
    const alturaFundo = imagemFundo.bitmap.height;

    // Calcular a altura total da nova imagem de fundo para acomodar o texto
    const font = await Jimp.loadFont(Jimp.FONT_SANS_64_BLACK);
    const alturaTexto = Jimp.measureTextHeight(font, 'Olá') - 100 ; // 10 pixels de margem
    const novaAlturaFundo = alturaFundo + alturaTexto;

    // Criar uma nova imagem de fundo com altura ajustada
    const imagemFundoAjustada = new Jimp(larguraFundo, novaAlturaFundo, 0xFFFFFFFF);
    imagemFundoAjustada.composite(imagemFundo, 0, 0);

    // Adicionar a imagem centralizada na imagem de fundo ajustada
    const xCentral = (larguraFundo - larguraCentral) / 2;
    const yCentral = (alturaFundo - alturaCentral) / 2;

    imagemFundoAjustada.composite(imagemCentral, xCentral, yCentral);

    // Adicionar o texto abaixo da imagem central
    const imagemFinal = await addText(imagemFundoAjustada, 'Usuário: ' + params.pushName + '! Hora: ' +hour+':'+minute + ':' + second + ' - Data: ' + formDate
    );

    const filePathOut = `./src/temp/menu_${randomId}.png`;
    // Salvar o resultado
    await imagemFinal.writeAsync(filePathOut);

    console.log('Imagem montada com sucesso!');
    
    return filePathOut;

  } catch (err) {
    console.error('Erro ao montar imagens:', err);
  }
}
