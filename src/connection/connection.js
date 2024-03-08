
const {
    makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    makeInMemoryStore
} = require('@whiskeysockets/baileys');

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
                setTimeout(() => connectInky(), 5000); // Tentar reconectar após 5 segundos
            }
        } else if (connection === "open") {
            console.log("Bot connected");
        } else if (connection === "connecting") {
            console.log("Connecting...");
        }
    });

    return sock;
}

module.exports = connectInky;
