/**
 * @license
 * InkyBot v0.3.1
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

    sock.ev.on("messages.upsert", async ({ messages, type }) => {

        /** Capture the array received by the listener */
        const messageReceived = messages[0];

        /**
         * Will not process the message if the information received isn't the message property
         */

        if (messageReceived.message) {
            
            /**
             * To get a message type
             */
            const messageType = Object.keys(messageReceived.message)[0];

            /**
             * If an incoming message is related to a status, it will not proceed with the commands
             */
            if (messageReceived.key && messageReceived.key.remoteJid == "status@broadcast") return;
            
            /**
             * 
             */
            await processorMessage(sock, messageReceived, messageType);
        };

    });
}

startInky();
