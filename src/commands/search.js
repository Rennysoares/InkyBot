
import { botSettings } from "../config.js";

const key = botSettings.customSearchKey

export async function search(sock, messageFrom, args, messageReceived) {

    if (!args) {
        const text = "Não existe pesquisa sem a pesquisa. Informe o que você quer pesquisar"
        await sock.sendMessage(
            messageFrom,
            {
                text: text
            },
            {
                messageReceived
            }
        );
        return
    }

    await sock.sendMessage(messageFrom, { react: { text: "🔎", key: messageReceived.key } })
    try {

        let url = `https://www.googleapis.com/customsearch/v1?key=${key}&cx=f3328827f6dee4617&q=${args}`;

        const getResponse = async () => {
            let response = await fetch(url, {
                method: "get",
                body: null,
            });

            let textResponse = "🔎Resultados obtidos do Google: \n\n"
            let resp = await response.json();
            let items = resp.items
            for (var queries = 0; queries < items.length; queries++) {
                textResponse = textResponse + `🌐` +
                items[queries].title + "\n📝 *Descrição*: " +
                items[queries].snippet + "\n🔗 *Link*: " +
                items[queries].link + "\n\n" 
            }

            return textResponse;
        };

        let textRes = await getResponse();
        await sock.sendMessage(
            messageFrom,
            {
                text: textRes
            },
            {
                messageReceived
            }
        );
        await sock.sendMessage(messageFrom, { react: { text: "", key: messageReceived.key } })
    } catch {
        const text = "Ocorreu um erro em sua pesquisa. Tente novamente"
        await sock.sendMessage(
            messageFrom,
            {
                text: text
            },
            {
                messageReceived
            }
        );
        await sock.sendMessage(messageFrom, { react: { text: "", key: messageReceived.key } })
    }

}
