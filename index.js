//Imports
const connectInky = require('./src/connection/connection')
const processorMessage = require('./src/commands/processor');

//Função para ligar o bot
async function startInky() {

    //Capturar o socket da conexão feita
    const sock = await connectInky();

    sock.ev.on("messages.upsert", async ({ messages }) => {

        //Capturar recebimento de informações
        const messageReceived = messages[0];

        //Se a informação recebida não for uma mensagem, ele não prosseguirá com os comandos
        if (!messageReceived.message) return;

        //Marcar a mensagem como lida
        await sock.readMessages([messageReceived.key.id]);

        //Obtém o tipo de mensagem
        const messageType = Object.keys(messageReceived.message)[0];

        //Se for uma mensagem recebida de uma lista de transmissão, ele não prosseguirá com os comandos
        if (messageReceived.key && messageReceived.key.remoteJid == "status@broadcast") return;

        //Função de processamento da mensagem
        await processorMessage(sock, messageReceived, messageType);  
       
    });
}

startInky();
