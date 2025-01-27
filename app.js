const topsecret = require('dotenv-safe').config({
    allowEmptyValues: true
});
const express = require("express");
var request = require('request');
const { stringSimilarity } = require("string-similarity-js");
const showdown = require("showdown");
const converter = new showdown.Converter({tables: true});
const path = require("path");
const bodyParser = require("body-parser"); // Für POST-Daten
const { send } = require("process");
const app = express();

const { GoogleGenerativeAI } = require("@google/generative-ai");
// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(topsecret.parsed.API_KEY_GOOGLE);

// Middleware für POST-Daten
app.use(bodyParser.urlencoded({ extended: true }));

// Setze EJS als Template-Engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Statische Dateien (CSS, Bilder, etc.)
app.use(express.static(path.join(__dirname, "public")));

// GET-Route für die Startseite
app.get("/", (req, res) => {
    res.render("index");
});

// Nur den korrigierten Satz
function extractFirstapostroph(input) {
    const match = input.match(/"([^"]*)"/); // Sucht das erste Wort in Anführungszeichen
    return match ? match[1] : null; // Gibt nur die gefundene Gruppe (ohne Anführungszeichen) zurück
}

// GET für den Lückentext
app.post("/api/tex2fill", (req, res) => {

    const userLearning = req.body.learn;
    console.log(userLearning);
    
    async function run() {
        const generationConfig = {
            responseMimeType: "application/json",
            temperature: 0.8,
        };

        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash-exp",
            systemInstruction: "Du bist eine KI die mir beim Deutsch lernen hilft. Das Niveau ist B2. Gebe die Tipps auf englisch zurück. Nutze das JSON Format: {'text': 'Ein deutscher Lückentext. Die Lücken mit ______ darstellen', 'answers': {'1': [Mehrere Lösungsmöglichkeiten]}, 'solution': '1': Lösung, 'tipps': [Tipps auf englisch]}",
            generationConfig: generationConfig,
        });
      
        const prompt = "Gib mir ein Lückentext";
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log(response.text());
        //const text = response["candidates"][0]["content"]["parts"][0]["text"];
        
        return(text);
    }

    var result = run();
    result.then(resu => res.send(resu));

})

// GET für das Memory
app.post("/api/memory", (req, res) => {

    const userLearning = req.body.learn;
    console.log(userLearning);

    async function run() {
        const generationConfig = {
            responseMimeType: "application/json",
            temperature: 0.8,
        };

        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash-exp",
            systemInstruction: `Du bist eine KI, die eine Liste an Wörtern mit dem Artikel ausgibt und den und das entsprechende icon sowie eine einzigartige Farbe im hex Format. Gib nur die Liste ist in einem JSON Format zurück. Beispiel: [{"icon": "🎨","text": "die Farben","color": "#DA70D6"}]`,
            generationConfig: generationConfig,
        });
      
        const prompt = "Gib mir 8 Wörter";
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log(response.text());
        
        return(text);
    }

    var result = run();
    result.then(resu => res.send(resu));
    /*
    var request = require('request');

    var options = {
        'method': 'POST',
        'url': `https://api.infomaniak.com/1/ai/${topsecret.parsed.SECRET}/openai/chat/completions`,
        'headers': {
          'Authorization': `Bearer ${topsecret.parsed.TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "messages": [
              {
                "content": `Du bist eine KI, die eine Liste an Wörtern mit dem Artikel ausgibt und den und das entsprechende icon sowie eine einzigartige Farbe im hex Format. Gib nur die Liste ist in einem JSON Format zurück. Beispiel: [{"icon": "🎨","text": "die Farben","color": "#DA70D6"}]`,
                "role": "system"
              },
              {
                  "content": "Gib mir 8 Wörter",
                  "role": "user"
              }
          ],
          "model": "mixtral"
        })  

    };

    request(options, function (error, response) {
      if (error) throw new Error(error);
      var result = JSON.parse(response.body)["choices"][0]["message"]["content"];
      res.send(result);
    });
    */

});


app.post("/api/exam", (req, res) => {
    
    const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash-exp",
        systemInstruction: "Du bist ein Deutschlehrer und hilfst dabei mich auf die B2 Prüfung vorzubereiten. Gib mir dafür eine Schreibaufgabe aus einer B2 Prüfung. Gib dabei Hilfestellungen in englisch. Wenn ich meine Antwort einreiche, korrigiere meine Fehler. Das Format: {'task_type': 'writing','level: 'B2','topic': 'Topic','instructions_de': 'Task', 'instructions_en': 'Summary in english','hints_en': ['hint 1', 'hint n']}",
    });
    
    const generationConfig = {
        temperature: 0.8,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
    };
    
    async function run() {
        const chatSession = model.startChat({
            generationConfig,
            //history: 
            /*
            [
            {
                role: "user",
                parts: [
                {text: "ich möchte üben"},
                ],
            },
            {
                role: "model",
                parts: [
                {text: "```json\n[\n  {\n    \"task_type\": \"writing\",\n    \"level\": \"B2\",\n    \"topic\": \"Meinungen austauschen\",\n    \"instructions_de\": \"Sie haben in einer Zeitschrift einen Artikel zum Thema 'Freiwilligenarbeit im Ausland' gelesen. In einem Internetforum diskutieren Sie nun mit anderen Teilnehmern über Ihre Meinung zu diesem Thema. Schreiben Sie einen Forumsbeitrag (ca. 200 Wörter), in dem Sie auf folgende Punkte eingehen: \\n\\n* Beschreiben Sie kurz die Vor- und Nachteile von Freiwilligenarbeit im Ausland, die im Artikel genannt werden.\\n* Erklären Sie Ihre eigene Meinung zu diesem Thema.\\n* Berichten Sie von einer persönlichen Erfahrung oder einer Erfahrung von Freunden/Bekannten mit Freiwilligenarbeit im Ausland.\\n* Geben Sie eine Empfehlung für oder gegen Freiwilligenarbeit im Ausland und begründen Sie diese.\",\n    \"instructions_en\": \"You have read an article in a magazine about 'Volunteering Abroad'. In an online forum, you are now discussing your opinion on this topic with other participants. Write a forum post (approx. 200 words) in which you address the following points:\\n\\n* Briefly describe the advantages and disadvantages of volunteering abroad mentioned in the article.\\n* Explain your own opinion on this topic.\\n* Report on a personal experience or an experience of friends/acquaintances with volunteering abroad.\\n* Give a recommendation for or against volunteering abroad and justify it.\",\n    \"hints_en\": [\n      \"Start with a brief introduction to the topic and the article you read.\",\n      \"Clearly state the pros and cons as mentioned in the article. Use phrases like 'According to the article...', 'The article mentions that...'\",\n      \"Make sure to clearly state your own opinion using phrases like 'In my opinion...', 'I believe that...', 'I think that...'\",\n      \"Try to make your personal experience or the experience of others as concrete as possible. What exactly happened? What did they learn?\",\n      \"Conclude with a clear recommendation using phrases like 'I would recommend...', 'I would not recommend...'\",\n      \"Pay attention to your word count and try to write approximately 200 words.\"\n    ]\n  }\n]\n```"},
                ],
            },
            {
                role: "user",
                parts: [
                {text: "Meiner Meinung nach ist es wichtig, Freiwillig im Ausland zu arbeiten"},
                ],
            },
            {
                role: "model",
                parts: [
                {text: "```json\n{\n  \"feedback\": {\n    \"overall_assessment\": \"The sentence is a good start and clearly expresses your opinion. However, it's a bit too short and could benefit from more context. Also there are some minor grammatical errors.\",\n    \"corrections\": [\n      {\n        \"original\": \"Meiner Meinung nach ist es wichtig, Freiwillig im Ausland zu arbeiten\",\n        \"corrected\": \"Meiner Meinung nach ist es wichtig, freiwillig im Ausland zu arbeiten.\",\n        \"explanation_en\": \"The word 'Freiwillig' should be 'freiwillig' (lowercase) because it is an adverb in this sentence.\"\n      }\n    ],\n     \"suggestions_en\": [\n      \"Try to expand on *why* you think it's important. What benefits do you see?\",\n       \"Consider adding a connecting phrase to lead into your opinion, for example, 'After reading the article, I believe that...' or 'Based on my understanding, ...'\"\n     ]\n  }\n}\n```"},
                ],
            },
            ],
            */
        });
    
        const result = await chatSession.sendMessage("Ich möchte üben");
        const text = result.response.text();
        console.log(text);
        return(text);
        
    }
    
    var result = run();
    result.then(resu => res.send(resu));
})

// POST-Route für das Formular
app.post("/submit", (req, res) => {
    console.log("gestartet")
    const userInput = req.body.userInput; // Nutzereingabe
    //const userLanguage = req.body.speak;
    const userLearning = req.body.learn;
    //console.log(`Ich spreche: ${userLanguage}`); 
    console.log(`Ich lerne: ${userLearning}`); 
    console.log(`Eingabe erhalten: ${userInput}`); // Ausgabe in der Konsole
    var message;
    switch (userLearning) {
        case 'english':
            message = "Correct and rephrase user text grammar errors. Always show the corrected sentence first in apostroph.";
            break;
        case 'german':
            message = "Focus on spelling and grammar. Always show the corrected sentence first in apostroph. Correct all mistakes in german and always show the rules behind and grammar structure in english. Display a table of declination. Display a second table of conjugation.";
            break;
        case 'spanish':
            message = "Corrige y reformula los errores gramaticales del texto del usuario delimitado por apóstrofo. Muestra una tabla de declinación.";
            break;
        case 'french':
            message = "Corrigez et reformulez les fautes de grammaire du texte de l'utilisateur. La phrase corrigée doit toujours apparaître en premier en apostrophe. montrer les règles qui se cachent derrière.";
            break;
        case 'italian':
            message = "Corregge e riformula gli errori grammaticali del testo dell'utente delimitato da apostrofo. Visualizza una tabella di declinazione.";
            break;
        case 'swedish':
            message = "Korrigerar och omformulerar grammatiska fel i användartext avgränsad av apostrof. Visar en tabell över böjning.";
            break;
    }

    var options = {
        'method': 'POST',
        'url': `https://api.infomaniak.com/1/ai/${topsecret.parsed.SECRET}/openai/chat/completions`,
        'headers': {
          'Authorization': `Bearer ${topsecret.parsed.TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "messages": [
              {
                "content": message,
                "role": "system"
              },
              {
                  "content": userInput,
                  "role": "user"
              }
          ],
          "model": "mixtral"
      })
      
            
      };
        
    var text = '{"model":"mixtral","id":"","object":"chat.completion","system_fingerprint":"2.4.1-sha-d2ed52f","created":1733343223,"choices":[{"index":0,"message":{"role":"assistant","content":"The correct form in German would be: \\"Ich w\\u00fcnsche dir viel Spa\\u00df bei deinen Hausaufgaben.\\"\\n\\nExplanation:\\n\\nIn the original sentence, the pronoun \\"dir\\" is placed before the verb \\"w\\u00fcnsche,\\" which is incorrect. In German, the pronoun should come after the verb in a sentence like this. Additionally, the word \\"bei\\" is necessary before \\"deinen Hausaufgaben\\" to indicate that the person is doing something while working on their homework.\\n\\nIn English, this rule can be explained as follows: In German, the pronoun (such as \\"dir\\" or \\"ihm\\") should come after the verb in a sentence where the verb is in the second position. This is known as the verb second (V2) rule. Furthermore, in sentences where someone is doing an action related to a specific thing or place, the preposition (such as \\"bei\\" or \\"auf\\") should come before that thing or place. This is known as the separable prefix rule."},"logprobs":null,"finish_reason":"stop"}],"usage":{"input_tokens":56,"output_tokens":224,"total_tokens":280}}';
    request(options, function (error, response) {
        if (error) throw new Error(error);
        // wenn die Anfrage geht, aber sonst etwas falsch ist
        if(JSON.parse(response.body).hasOwnProperty("error")) {
            var send_data = { 
                "points": 0,
                "title": ":(",
                "blabla": converter.makeHtml(JSON.parse(response.body)["error"]["code"])
            };
            res.send(send_data);
        } else {
            var result = JSON.parse(response.body)["choices"][0]["message"]["content"];
            var correction = extractFirstapostroph(result);
            if(correction) {
                var points = stringSimilarity(userInput,correction);
            } else {
                var points = 0;
            }
            var send_data = { 
                "points": points,
                "title": correction,
                "blabla": converter.makeHtml(result)
            };
            res.send(send_data);
        }
    });
   /*
    res.send({ 
        "points": 0,
        "title": String(Math.random()),
        "blabla": "sdsdsdasa"
    })
    */

});

// Server starten
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server läuft auf http://localhost:${PORT}`);
});
