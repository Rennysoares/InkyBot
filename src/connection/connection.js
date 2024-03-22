const {
    makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    makeInMemoryStore,
} = require('@whiskeysockets/baileys');

const handlingMessages = require('../commands/handlingMessages');
const pino = require('pino');
const { Boom } = require('@hapi/boom');

async function connectInky() {

    const auth = await useMultiFileAuthState("./src/temp/session");
    const sock = makeWASocket({
        printQRInTerminal: true,
        browser: ["InkyBot", "", ""],
        auth: auth.state,
        logger: pino({ level: "silent" }),
    });

    // the store maintains the data of the WA connection in memory
    // can be written out to a file & read from it
    const store = makeInMemoryStore({})
    // can be read from a file
    store.readFromFile('./src/temp/history/baileys_store.json')
    // saves the state to a file every 10s
    setInterval(() => {
        store.writeToFile('./src/temp/history/baileys_store.json')
    }, 10_000)
    store.bind(sock.ev)

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
