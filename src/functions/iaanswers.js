const { GoogleGenerativeAI } = require("@google/generative-ai");
const { sendText, sendReaction } = require("./answers");
const { botSettings } = require("../config/config")
async function InkyIaAnswer(sock, messageFrom, args, messageReceived) {

    if (args.length == 0) {
        text = `Sou um bot, não um advinhador ;-;`
        await sendText(sock, messageFrom, text, messageReceived)
        return
    }

    apiKey = botSettings.geminiApiKey
    // Access your API key as an environment variable (see "Set up your API key" above)
    const genAI = new GoogleGenerativeAI(apiKey);

    async function run() {
        // For text-only input, use the gemini-pro model
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = args

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        await sendReaction(sock, messageFrom, '', messageReceived)
        await sendText(sock, messageFrom, text, messageReceived)
        console.log(text);
    }
    try{
        await sendReaction(sock, messageFrom, '🤔', messageReceived)
        await run();
    } catch (error) {
        await sendReaction(sock, messageFrom, '', messageReceived)
        let text = `Desculpe-me, no momento não estou respondendo perguntas`
        await sendText(sock, messageFrom, text, messageReceived)
        console.error(error)
      }
    
}

module.exports = {
    InkyIaAnswer
}