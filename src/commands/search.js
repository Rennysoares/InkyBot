
import { botSettings } from "../config.js";

const key = botSettings.customSearchKey

export async function search(params) {

    if (!params.args) {
        const text = "Não existe pesquisa sem a pesquisa. Informe o que você quer pesquisar"
        await params.sock.sendMessage(
            params.messageFrom,
            {
                text: text
            },
            {
                quoted: params.messageReceived
            }
        );
        return
    }

    await params.sock.sendMessage(params.messageFrom, { react: { text: "🔎", key: params.messageReceived.key } })
    try {

        let url = `https://www.googleapis.com/customsearch/v1?key=${key}&cx=f3328827f6dee4617&q=${params.args}`;

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
        await params.sock.sendMessage(
            params.messageFrom,
            {
                text: textRes
            },
            {
                quoted: params.messageReceived
            }
        );
        await params.sock.sendMessage(params.messageFrom, { react: { text: "", key: params.messageReceived.key } })
    } catch {
        const text = "Ocorreu um erro em sua pesquisa. Tente novamente"
        await params.sock.sendMessage(
            params.messageFrom,
            {
                text: text
            },
            {
                quoted: params.messageReceived
            }
        );
        await params.sock.sendMessage(params.messageFrom, { react: { text: "", key: params.messageReceived.key } })
    }

}
