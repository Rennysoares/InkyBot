const {
    makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    makeInMemoryStore,
} = require('@whiskeysockets/baileys');
const inquirer = require("inquirer")
const handlingMessages = require('../commands/handlingMessages');
const pino = require('pino');
const { Boom } = require('@hapi/boom');

const usePairingCode = process.argv.includes("-pairing-code");

async function connectInky() {

    const auth = await useMultiFileAuthState("./src/session");
    const sock = makeWASocket({
        printQRInTerminal: !usePairingCode,
        mobile: false,
        browser: ["Chrome (Linux)", "", ""],
        auth: auth.state,
        logger: pino({ level: "silent" }),
    });

    if (sock.user == null && usePairingCode){
        let getNumber = await inquirer.prompt([{type: 'input', name: 'number', message: 'You number->'}]);
        let code = await sock.requestPairingCode(getNumber.number);
        console.log("Your connection number is " + code);
    }

    sock.ev.on("creds.update", auth.saveCreds);

    sock.ev.on("connection.update", async (message) => {
        const { connection, lastDisconnect } = message;
        if (connection === "close") {
            console.log("Connection closed");
            const shouldReconnect = lastDisconnect.error instanceof Boom && lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) {
                setTimeout(() => connectInky(), 10000); // Tentar reconectar após 10 segundos
            }
        } else if (connection === "open") {
            console.log("Connected");
        } else if (connection === "connecting") {
            console.log("Connecting...");
        }
    });
    
    sock.ev.on("messages.upsert", async ({ messages, type }) => {
        /** Capture the array received by the listener */
        const messageReceived = messages[0];
        /** Will not process the message if the information received isn't the message property */

        if (messageReceived.message) {
            /** If an incoming message is related to a status, it will not proceed with the commands */
            if (messageReceived.key && messageReceived.key.remoteJid == "status@broadcast") return;
            
            /** Here is the processing message */
            await handlingMessages(sock, messageReceived);
        };
    });
}

module.exports = connectInky;
