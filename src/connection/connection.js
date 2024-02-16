//Import Baileys Library
const {
    makeWASocket,
    useMultiFileAuthState,
} = require('@whiskeysockets/baileys');

const pino = require('pino');

async function connectInky() {

    const auth = await useMultiFileAuthState("session");

    const sock = makeWASocket({
        printQRInTerminal: true,
        browser: ["InkyBot", "", ""],
        auth: auth.state,
        logger: pino({ level: "silent" }),
    });

    sock.ev.on("creds.update", auth.saveCreds);

    sock.ev.on("connection.update", async ({ connection }) => {
        if (connection === "open") {
            console.log("Bot connected");
        } else if (connection === "close") {
            await connectInky();
        }
    });

    return sock;
}

module.exports = connectInky;
