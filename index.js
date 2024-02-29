/**
 * @license
 * InkyBot v0.2.0
 * Copyright 2024 rennysoares and other contributors.
 * This code is released under the MIT license.
 * SPDX-License-Identifier: MIT
 */

const connectInky = require('./src/connection/connection')
const processorMessage = require('./src/commands/processor');

/**
 * Socket configured to render the QR code for connection by node.
 * 
 * TODO: Thought the 'src/config/config.js' file, create a boolean key
 * in the 'configBot' constant for session creation by pairing code.
 */

async function startInky() {

    const sock = await connectInky();

    sock.ev.on("messages.upsert", async ({ messages }) => {

        /** Capture the array received by the listener */
        const messageReceived = messages[0];

        /**
         * Will not process the message if the information received isn't the message property
         */

        if (!messageReceived.message) return;

        /**
         * Get type message
         * 
         * TODO: Check if the 'type' property of the callback is the same by getting the 'messages' array
         */

        const messageType = Object.keys (messageReceived.message)[0];

        //Se for uma mensagem recebida for relacionado a um status, ele não prosseguirá com os comandos
        /**
         * 
         */
        if (messageReceived.key && messageReceived.key.remoteJid == "status@broadcast") return;

        //Função de processamento da mensagem
        await processorMessage(sock, messageReceived, messageType);  
       
    });
}

startInky();
