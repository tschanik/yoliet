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
