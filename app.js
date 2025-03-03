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
const crypto = require('crypto');

const { GoogleGenerativeAI } = require("@google/generative-ai");
// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(topsecret.parsed.API_KEY_GOOGLE);

// Middleware für POST-Daten
app.use(bodyParser.urlencoded({ extended: true }));

app.use(function(req, res, next) {
    // Generate a random nonce for each request
    const nonce = crypto.randomBytes(16).toString('base64');
    // Set the Content-Security-Policy header with the nonce
    res.setHeader(
        'Content-Security-Policy',
        `default-src 'self'; script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-inline'; style-src 'self' https://cdnjs.cloudflare.com; font-src 'self' https://cdnjs.cloudflare.com; object-src 'none'; base-uri 'none';`
    )
    
    // Pass the nonce to the EJS template
    res.locals.nonce = nonce;

    return next();
});

// Setze EJS als Template-Engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Statische Dateien (CSS, Bilder, etc.)
app.use(express.static(path.join(__dirname, "public")));

// GET-Route für die Startseite
app.get("/", (req, res) => {
    res.render('index');
});

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
    var message;
    switch (userLearning) {
        case 'english':
            message = `You are an AI that outputs a list of words with the article and the corresponding icon and a unique color in hex format. Only the list is returned in a JSON format. Example: [{"icon": "🎨","text": "the color","color": "#DA70D6"}]`;
            break;
        case 'german':
            message = `Du bist eine KI, die eine Liste an Wörtern mit dem Artikel ausgibt und den und das entsprechende icon sowie eine einzigartige Farbe im hex Format. Gib nur die Liste ist in einem JSON Format zurück. Beispiel: [{"icon": "🎨","text": "die Farben","color": "#DA70D6"}]`;
            break;
        case 'spanish':
            message = `Es una IA que devuelve una lista de palabras con el artículo y el icono correspondiente y un color único en formato hexadecimal. Sólo se devuelve la lista en formato JSON. Ejemplo: [{"icon": "🎨","text": "los colores","color": "#DA70D6"}]`;
            break;
        case 'french':
            message = `Tu es une IA qui renvoie une liste de mots avec l'article et l'icône correspondante ainsi qu'une couleur unique au format hex. Ne renvoie que la liste est dans un format JSON. Exemple: [{"icon": "🎨","text": "Les couleurs","color": "#DA70D6"}]`;
            break;
        case 'italian':
            message = `Si tratta di un'intelligenza artificiale che restituisce un elenco di parole con l'articolo e l'icona corrispondente e un colore unico in formato esadecimale. Solo l'elenco viene restituito in formato JSON. Esempio: [{"icon": "🎨","text": "I colori","color": "#DA70D6"}]`;
            break;
        case 'swedish':
            message = `Du är en AI som matar ut en lista med ord med artikeln och motsvarande ikon och en unik färg i hex-format. Endast listan returneras i JSON-format. Exempel: [{"icon": "🎨","text": "färgerna","color": "#DA70D6"}]`;
            break;
    }



    async function run() {
        const generationConfig = {
            responseMimeType: "application/json",
            temperature: 0.8,
        };

        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash-exp",
            systemInstruction: message,
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
            message = `You are a english teacher, and I need help reviewing my english sentences. JSON format: {corrected_sentence: "", english_translation: "", grammar_explanation: "", tipps: []}`;
            break;
        case 'german':
            message = `You are a German teacher, and I need help reviewing my German sentences. Check if my sentence is grammatically correct. Provide the following:
                        A correct or corrected version of my sentence if needed.
                        An English translation of the sentence.
                        A detailed explanation of the grammar:
                        Identify the articles of nouns (der, die, das).
                        Specify the grammatical case (nominative, accusative, dative, genitive).
                        Indicate if nouns, adjectives, or articles need to be declined based on the case.
                        Identify the tense used in the sentence (present, past, future, etc.).
                        Brief tips on why specific forms or structures are used.
                        JSON format: {corrected_sentence: "", english_translation: "", grammar_explanation: "", tipps: []}`;
            break;
        case 'spanish':
            message = `You are a spanish tacher, and I need help reviewing my spanish sentences. JSON format: {corrected_sentence: "", english_translation: "", grammar_explanation: "", tipps: []}`;
            break;
        case 'french':
            message = `You are a french tacher, and I need help reviewing my french sentences. JSON format: {corrected_sentence: "", english_translation: "", grammar_explanation: "", tipps: []}`;
            break;
        case 'italian':
            message = `You are a italian tacher, and I need help reviewing my italian sentences. JSON format: {corrected_sentence: "", english_translation: "", grammar_explanation: "", tipps: []}`;
            break;
        case 'swedish':
            message = `You are a swedish tacher, and I need help reviewing my swedish sentences. JSON format: {corrected_sentence: "", english_translation: "", grammar_explanation: "", tipps: []}`;
            break;
    }
    
    async function run(message,userInput) {
        const generationConfig = {
            responseMimeType: "application/json",
            temperature: 0.8,
        };

        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash-exp",
            systemInstruction: message,
            generationConfig: generationConfig,
        });
        const result = await model.generateContent(userInput);
        const text = result.response.text();
        return(text);
    }

    var result = run(message, userInput);

    result.then((value) => {
        const obj = JSON.parse(value);
        obj.points = stringSimilarity(userInput,obj.corrected_sentence);
        obj.grammar_explanation = converter.makeHtml(obj.grammar_explanation);
        console.log(obj);
        res.send(obj);
    }).catch((error) => {
        console.error("Error:", error);
        res.status(500).send("An error occurred");
    });

});

// Server starten
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server läuft auf http://localhost:${PORT}`);
});
