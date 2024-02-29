

const OpenAI = require('openai');

async function InkyIaAnswer(sock, messageFrom, args, command, messageReceived){

    //setup api key
    apiKey = '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'
    const openai = new OpenAI({
        apiKey: apiKey, // This is the default and can be omitted
    });

    //get response
    const userInput = args
    const getResponse = async () => {

        const chatCompletion = await openai.chat.completions.create({
            messages: [{ role: 'user', content: userInput }],
            model: 'gpt-3.5-turbo',
          });

        console.log(chatCompletion)

    }
    getResponse();
}

module.exports = {
    InkyIaAnswer
}