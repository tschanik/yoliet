function getspecialchar(language,special_char) {
    let charater;
    switch (language) {
        case 'swedish':
            charater = ["Å","å", "Ä", "ä", "Ö","ö", "Ø", "ø"];
            break;
        case 'german':
            charater = ["Ä","ä","Ö","ö","Ü","ü","ß"];
            break;
        case 'spanish':
            charater = ["Á","á","É","Í","í","Ñ","ñ","Ó","ó","Ú","ú","Ü","ü","¡","¿"];
            break;
        case 'french':
            charater = ["é","à","è","ù","â","ê","î","ô","û","ç","ë","ï","ü"];
            break;
    }

    for(const char of charater) {
        const clickable = document.createElement("button");
        clickable.setAttribute("type","button");
        clickable.className = "umlaute";
        const clickable_text = document.createTextNode(char);
        clickable.appendChild(clickable_text);
        special_char.append(clickable);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");
    const input_field = document.getElementById("userInput");
    const history = document.getElementById("result_history");
    const result_div = document.getElementById("current_result");
    const result_output = document.querySelector(".result");
    const skeleton = document.getElementById("loading");
    const selected = document.getElementById("learn_selected");
    const special_char = document.getElementById("special");
    const impressum = document.getElementById("impressum");
    const showimpressum = document.getElementById("showimpressum");
    var points = 0;
    var correction = "";
    input_field.focus();
    input_field.select();

    window.onload = getspecialchar("german",special_char);
    
    selected.addEventListener("change", event => {
        const language = selected.value;
        input_field.placeholder = 'Type a sentence in ' + language.charAt(0).toUpperCase() + language.slice(1) + '.';
        
        special_char.innerHTML = "";
        getspecialchar(language,special_char);

    });

    showimpressum.addEventListener("click", event => {
        const corrected = document.createElement("h3");
        corrected.className = "correction";
        correction = "Impressum";
        corrected.innerText = correction;
        result_div.appendChild(corrected);
        result_output.innerHTML = impressum.innerHTML;
    });

    showmemory.addEventListener("click", event => {
        result_output.innerHTML = "";
        const corrected = document.createElement("h3");
        correction = "Memory";
        corrected.innerText = correction;
        result_div.appendChild(corrected);
        const addDiv = document.createElement("div");
        addDiv.className = "memory-game";
        result_div.appendChild(addDiv);
        getMemoryData();
    });

    // Helper function to submit the form dynamically
    function submitForm(actionUrl) {
        
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = actionUrl;

        // Add the selected dropdown value
        const learnInput = document.createElement('input');
        learnInput.type = 'hidden';
        learnInput.name = 'learn';
        learnInput.value = selected.value;
        form.appendChild(learnInput);

        // Append the form to the body and submit it
        document.body.appendChild(form);

        const formData = new FormData(form);
        return new URLSearchParams(formData);
    }

    text2fill.addEventListener("click", event => {
        result_output.innerHTML = "";
        const corrected = document.createElement("h3");
        correction = "Text";
        corrected.innerText = correction;
        result_div.appendChild(corrected);

        // Funktion, um ein HTML Dropdown-Menü mit Textlücken und Validierung zu generieren
        function generateDropdownWithValidation(data) {
            const { text, answers, solution, tipps } = data;

            // Hilfsfunktion, um ein Dropdown-Menü zu generieren
            function createDropdown(id, options) {
                const select = document.createElement('select');
                select.id = `dropdown-${id}`;
                select.setAttribute('data-answer', solution[id]);
                select.style.margin = '0 5px';

                // Standardoption
                const defaultOption = document.createElement('option');
                defaultOption.value = '';
                defaultOption.textContent = '---';
                defaultOption.disabled = true;
                defaultOption.selected = true;
                select.appendChild(defaultOption);

                // Optionen aus den Antworten generieren
                options.forEach(option => {
                    const opt = document.createElement('option');
                    opt.value = option;
                    opt.textContent = option;
                    select.appendChild(opt);
                });

                // Validierungslogik bei Änderung des Dropdowns
                select.addEventListener('change', (e) => {
                    const selectedValue = e.target.value;
                    const correctAnswer = e.target.getAttribute('data-answer');

                    if (selectedValue === correctAnswer) {
                        e.target.style.backgroundColor = 'lightgreen';
                    } else {
                        e.target.style.backgroundColor = 'lightcoral';
                    }
                });

                return select;
            }

            // Text mit Dropdown-Menüs erstellen
            const container = result_div;
            const textParts = text.split(/_+/);

            textParts.forEach((part, index) => {
                container.appendChild(document.createTextNode(part));

                if (answers[index + 1]) {
                    const dropdown = createDropdown(index + 1, answers[index + 1]);
                    container.appendChild(dropdown);
                }
            });

            // Tipps hinzufügen
            const tipsContainer = result_div;
            linebreak = document.createElement("br");
            tipsContainer.appendChild(linebreak);
            const tipsTitle = document.createElement('h3');
            tipsTitle.style.marginTop = "2rem";
            tipsTitle.textContent = 'Tipps:';
            tipsContainer.appendChild(tipsTitle);

            const tipsList = document.createElement('ul');
            tipps.forEach(tip => {
                const tipItem = document.createElement('li');
                tipItem.textContent = tip;
                tipsList.appendChild(tipItem);
            });
            tipsContainer.appendChild(tipsList);

            container.appendChild(tipsContainer);

            return container;
        }

        async function getText() {
            skeleton.style.display = "block"; // Anzeigen dass etwas passiert
            //const formData = new FormData(submitForm('/text2fill'));
            //const result = await fetch('/api/tex2fill');
            const result = await fetch("/api/tex2fill", {
                method: "POST",
                body: submitForm('/text2fill'),
            });

            const data = await result.json();
            skeleton.style.display = "none";
            // Funktion aufrufen und in den DOM einfügen
            document.body.appendChild(generateDropdownWithValidation(data));
            //result_output.innerHTML += text["text"];
            //result_output.innerHTML += "<br><br>";
            //result_output.innerHTML += text["tipps"][0];
        }
        /*
        const text = {"text": "Der  ______ Student besuchte jeden Tag die Bibliothek, um sich auf die Prüfung vorzubereiten. Er las ______ Bücher und ______ Notizen. Er arbeitete ______ und ______, um alles zu verstehen.  Seine ______ war hoch.  Am Prüfungstag war er ______.", "answers": {"1": ["fleißige", "fleißiger", "fleißigen", "fleißigsten"], "2": ["viele", "vielen", "viel", "vielleicht"], "3": ["machte", "machten", "macht", "machen"], "4": ["hart", "harten", "härtesten", "härter"], "5": ["konzentriert", "konzentrierte", "konzentriertem", "konzentriertesten"], "6": "Motivation", "7": ["ruhig", "ruhigere", "ruhigsten", "ruhiger"]}, "solution": {"1": "fleißige", "2": "viele", "3": "machte", "4": "hart", "5": "konzentriert", "6": "Motivation", "7": "ruhig"}, "tipps": ["To fill in the gaps, think about the grammatical function of each word.  Pay attention to the gender and number of the nouns and the verb endings. Consider the context of the sentence and the meaning you want to convey.  Review your German grammar rules for noun declension and verb conjugation to ensure accuracy.  If you're unsure about a word, look it up in a dictionary. Use online resources or practice exercises to reinforce your understanding of German grammar and vocabulary."]};
        const data = {
            text: text["text"],
            answers: text["answers"],
            solution: text["solution"],
            tipps: text["tipps"]
        };
        document.body.appendChild(generateDropdownWithValidation(data));
        */
        getText();

        
    });

    exam.addEventListener("click", event => {
        result_output.innerHTML = "";
        const corrected = document.createElement("h3");
        correction = "Exam Simulation";
        corrected.innerText = correction;
        result_div.appendChild(corrected);
        async function getExam() {
            skeleton.style.display = "block"; // Anzeigen dass etwas passiert
            const result = await fetch("/api/exam", {
                method: "POST",
                body: submitForm('/exam'),
            });

            const data = await result.json();
            skeleton.style.display = "none";

            
            result_output.innerHTML += data["instructions_de"];
            result_output.innerHTML += "<br><br>";
            result_output.innerHTML += data["instructions_en"];
            linebreak = document.createElement("br");
            result_output.appendChild(linebreak);
            const tipsTitle = document.createElement('h3');
            tipsTitle.style.marginTop = "2rem";
            tipsTitle.textContent = 'Tipps:';
            result_output.appendChild(tipsTitle);
            const tipsList = document.createElement('ul');
            const tipps = data["hints_en"];
            tipps.forEach(tip => {
                const tipItem = document.createElement('li');
                tipItem.textContent = tip;
                tipsList.appendChild(tipItem);
            });
            result_output.appendChild(tipsList);
        }

        getExam();

    })
    
    special_char.addEventListener("click", event => {
        input_field.value += event.target.innerText;
    });
    

    form.addEventListener("submit", async (event) => {
            move_to_accordion();
            event.preventDefault(); // Standard-Formular-Absenden verhindern 
            // bis die Anfrage da ist, schonmal ein span anlegen um den Input anzuzeigen
            const showinput = document.createElement("span");
            showinput.className = "r_userInput";
            showinput.innerText = input_field.value;
            input_field.blur(); // Focus entfernen
            result_div.appendChild(showinput);

            const formData = new FormData(form);
            skeleton.style.display = "block"; // Anzeigen dass etwas passiert
            input_field.value = ""; // Input Text leeren
            const response = await fetch("/submit", {
                method: "POST",
                body: new URLSearchParams(formData),
            });
            
            // Stelle die Anfrage an die API
            const result = await response.json();
            
            skeleton.style.display = "none";
            points = result["points"];
            showinput.innerText += ' | ' + Math.round(points*100,0) + ' Punkte';

            const corrected = document.createElement("h3");
            corrected.className = "correction";
            correction = result["corrected_sentence"];
            corrected.innerText = correction;
            result_div.appendChild(corrected);
            result_div.innerHTML += result["english_translation"];
            result_div.innerHTML += result["grammar_explanation"];

            const tipsTitle = document.createElement('h3');
            tipsTitle.style.marginTop = "2rem";
            tipsTitle.textContent = 'Tipps:';
            result_div.appendChild(tipsTitle);
            const tipsList = document.createElement('ul');
            const tipps = result["tipps"];
            tipps.forEach(tip => {
                const tipItem = document.createElement('li');
                tipItem.textContent = tip;
                tipsList.appendChild(tipItem);
            });
            result_div.appendChild(tipsList);
    });

    function move_to_accordion() {
        // wenn es ein result gegeben hat, soll das historiesiert werden
        if(result_output.innerText.trim() !== "") {
            const newbutton = document.createElement("button");
            newbutton.textContent = correction;
            newbutton.className = "accordion";

            // Ändere die Farbe der Schrift, je nach dem wie gut die Eingabe war
            newbutton.setAttribute("style",`color: rgba(255, 255, 255, ${1.25 - points})`);
            history.appendChild(newbutton);

            newbutton.addEventListener("click", function() {
                newbutton.classList.toggle("active");
                const panel = newbutton.nextElementSibling;
                if (panel.style.display === "block") {
                panel.style.display = "none";
                } else {
                panel.style.display = "block";
                }
            });
            
            const panel = newbutton.nextElementSibling;
            const newpanel = document.createElement("div");
            newpanel.className = "panel";
            newpanel.innerHTML = result_output.innerHTML;
            result_output.innerHTML = "";
            history.appendChild(newpanel);
        }
    }
    
    input_field.addEventListener("focus", (event) => {
        move_to_accordion();
    });

    async function getMemoryData() {
        skeleton.style.display = "block"; // Anzeigen dass etwas passiert
        const result = await fetch("/api/memory", {
            method: "POST",
            body: submitForm('/memory'),
        });
        const pairs = await result.json();
        skeleton.style.display = "none";

        const cards = [...pairs.map(pair => ({ content: pair.icon, type: 'icon', color: pair.color })),
        ...pairs.map(pair => ({ content: pair.text, type: 'text', color: pair.color }))];
        
        // Shuffle the cards
        cards.sort(() => Math.random() - 0.5);
        const gameBoard = document.querySelector('.memory-game');

        cards.forEach(cardData => {
            const card = document.createElement('div');
            card.classList.add('memory-card');
            card.innerHTML = `<span>${cardData.content}</span>`;
            card.dataset.type = cardData.type;
            card.dataset.color = cardData.color;
            gameBoard.appendChild(card);
        });

        let firstCard, secondCard;
        let lockBoard = false;

        function flipCard() {
            if (lockBoard || this === firstCard) return;

            this.classList.add('flipped');
            this.style.borderColor = this.dataset.color;

            if (!firstCard) {
                firstCard = this;
                return;
            }

            secondCard = this;
            checkForMatch();
        }

        function checkForMatch() {
            const isMatch = pairs.some(pair =>
                (firstCard.dataset.type === 'icon' && secondCard.dataset.type === 'text' && firstCard.innerText.trim() === pair.icon && secondCard.innerText.trim() === pair.text) ||
                (firstCard.dataset.type === 'text' && secondCard.dataset.type === 'icon' && firstCard.innerText.trim() === pair.text && secondCard.innerText.trim() === pair.icon)
            );

            isMatch ? disableCards() : unflipCards();
        }

        function disableCards() {
            firstCard.removeEventListener('click', flipCard);
            secondCard.removeEventListener('click', flipCard);
            resetBoard();
        }

        function unflipCards() {
            lockBoard = true;
            setTimeout(() => {
                firstCard.classList.remove('flipped');
                secondCard.classList.remove('flipped');
                firstCard.style.borderColor = 'transparent';
                secondCard.style.borderColor = 'transparent';
                resetBoard();
            }, 1000);
        }

        function resetBoard() {
            [firstCard, secondCard, lockBoard] = [null, null, false];
        }

        document.querySelectorAll('.memory-card').forEach(card => {
            card.addEventListener('click', flipCard);
        });

    }

});