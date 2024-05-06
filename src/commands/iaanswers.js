import { GoogleGenerativeAI } from "@google/generative-ai";
import { sendText, sendReaction } from "./answers.js";
import { botSettings } from "../config.js";

export async function InkyIaAnswer(params) {

    if (!params.args) {
        text = `Sou um bot, não um advinhador ;-;`
        await sendText(params.sock, params.messageFrom, text, params.messageReceived)
        return
    }

    const apiKey = botSettings.geminiApiKey
    // Access your API key as an environment variable (see "Set up your API key" above)
    const genAI = new GoogleGenerativeAI(apiKey);

    async function run() {
        // For text-only input, use the gemini-pro model
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = params.args

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        await sendReaction(params.sock, params.messageFrom, '', params.messageReceived)
        await sendText(params.sock, params.messageFrom, text, params.messageReceived)
        console.log(text);
    }
    try{
        await sendReaction(params.sock, params.messageFrom, '🤔', params.messageReceived)
        await run();
    } catch (error) {
        await sendReaction(params.sock, params.messageFrom, '', params.messageReceived)
        let text = `Desculpe-me, no momento não estou respondendo perguntas`
        await sendText(params.sock, params.messageFrom, text, params.messageReceived)
        console.error(error)
      }
    
}
