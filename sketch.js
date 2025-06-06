// sketch.js

let gameState = 'startScreen';
let canvasWidth = 800;
let canvasHeight = 600;

let player;
let history = []; // Lagrar spelarens stats varje år för grafen

let currentEvent = null;
let choiceButtons = [];
let nextYearButton;
let reflectionText;

function setup() {
    createCanvas(canvasWidth, canvasHeight);
    textFont('Verdana');
    resetGame();
}

function resetGame() {
    // Slumpmässiga startförutsättningar
    const sesChoices = ['arbetarklass', 'medelklass', 'överklass'];
    const locationChoices = ['småstad', 'medelstor stad', 'storstad'];
    const genderChoices = ['man', 'kvinna'];
    
    let ses = random(sesChoices);
    let location = random(locationChoices);

    player = {
        birthYear: int(random(1970, 2006)),
        gender: random(genderChoices),
        ses: ses,
        location: location,
        age: 0,
        year: 0, // Sätts nedan
        health: int(random(70, 95)),
        economy: 0, // Startkapital baserat på klass
        education: 0, // Grundpotential baserat på klass
        socialCapital: 0, // Nätverk etc. baserat på klass
        mentalHealth: int(random(65, 90)),
        log: [], // Logg för val
        timeline: [] // Lagrar {år, händelse}
    };
    
    // Sätt startvärden baserat på socioekonomisk status (SES)
    switch(ses) {
        case 'arbetarklass':
            player.economy = int(random(10, 25));
            player.education = int(random(25, 45));
            player.socialCapital = int(random(15, 30));
            break;
        case 'medelklass':
            player.economy = int(random(30, 50));
            player.education = int(random(40, 60));
            player.socialCapital = int(random(30, 50));
            break;
        case 'överklass':
            player.economy = int(random(55, 80));
            player.education = int(random(50, 70));
            player.socialCapital = int(random(50, 75));
            break;
    }
    
    player.year = player.birthYear;
    
    history = []; // Nollställ historiken
    currentEvent = null;
    choiceButtons = [];

    // Skapa en knapp för att gå vidare mellan åren
    nextYearButton = new Button("Nästa År", width - 130, height - 50, 110, 30, advanceTime);
    nextYearButton.hidden = true;
    
    gameState = 'startScreen';
}

function draw() {
    background(255);
    
    switch (gameState) {
        case 'startScreen':
            drawStartScreen();
            break;
        case 'gameRunning':
            drawGameScreen();
            break;
        case 'endScreen':
            drawEndScreen();
            break;
        case 'reflection':
            drawReflectionScreen();
            break;
    }
}

// ---- RIT-FUNKTIONER FÖR OLIKA TILLSTÅND ----

function drawStartScreen() {
    textAlign(CENTER, CENTER);
    fill(0);
    textSize(26);
    text('Livsbanan: En Simulering', width / 2, 50);

    textSize(16);
    fill(50);
    let startText = `Du föddes ${player.year} som ${player.gender} i en ${player.ses}-familj i en ${player.location}.\n\nDina startförutsättningar kommer att forma dina möjligheter i livet. Vissa dörrar kommer att vara öppna, andra stängda. Vissa val kommer att vara enkla, andra kräver kamp.\n\nKlicka för att börja din resa.`;
    text(startText, width / 2, height / 2 - 100, width - 100, 300);
}

function drawGameScreen() {
    drawStatus();
    nextYearButton.hidden = (currentEvent !== null); // Dölj knappen när val ska göras
    nextYearButton.draw();

    if (currentEvent) {
        fill(0);
        textAlign(LEFT);
        textSize(22);
        text(currentEvent.title, 50, 180);
        
        fill(50);
        textSize(15);
        textWrap(WORD);
        text(currentEvent.description, 50, 220, width - 100);

        choiceButtons.forEach(btn => btn.draw());
    } else {
        textAlign(CENTER);
        let context = getHistoricalContext(player.year);
        if(context.contextText) {
            fill(150, 0, 0);
            textSize(14);
            text("Historisk händelse: " + context.contextText, width/2, height/2);
        }
    }
}

function drawEndScreen() {
    background(10, 20, 30);
    textAlign(CENTER);
    fill(255);
    textSize(28);
    text("Din Livsbana: En sammanfattning", width / 2, 50);

    // Rita grafen
    drawTimelineGraph();
    
    fill(200);
    textSize(14);
    text("Klicka för att reflektera över din resa.", width/2, height - 30);
}

function drawReflectionScreen() {
     background(250);
     textAlign(LEFT);
     fill(0);
     textSize(22);
     text("Reflektion", 50, 50);

     textSize(16);
     textWrap(WORD);
     let reflectionText = `Titta på din livsbana. Vilka faktorer tror du hade störst inverkan på ditt liv?\n\n- Hur påverkade din socioekonomiska bakgrund (${player.ses}) dina första år och dina utbildningsval?\n\n- Märkte du av några historiska händelser, som ekonomiska kriser eller högkonjunkturer?\n\n- Vissa val var kanske svårare att lyckas med. Detta simulerar strukturella hinder – idén att inte alla har samma reella möjlighet att genomföra ett val, även om det teoretiskt sett är "fritt".\n\n- Hur påverkade dina val din psykiska hälsa och ditt sociala kapital över tid?\n\nSpelet visar hur individens "fria vilja" alltid verkar inom ramen för de strukturer och förutsättningar som samhället och historien ger. Spela gärna igen för att se ett helt annat livsöde.`
     text(reflectionText, 50, 120, width-100, height-150);
     
     textSize(14);
     fill(100);
     text("Klicka för att starta en ny simulering.", 50, height-50);
}


// ---- HJÄLP- OCH LOGIK-FUNKTIONER ----

function advanceTime() {
    if (currentEvent) return; // Kan inte gå vidare om ett val måste göras

    // Avsluta spelet vid 65
    if (player.age >= 65) {
        gameState = 'endScreen';
        return;
    }

    player.age++;
    player.year++;

    // Små, årliga förändringar
    let context = getHistoricalContext(player.year);
    player.mentalHealth = constrain(player.mentalHealth + context.mentalHealthModifier + random(-1, 1), 0, 100);

    // Spara nuvarande status för grafen
    history.push({
        year: player.year,
        age: player.age,
        economy: player.economy,
        health: player.health,
        mentalHealth: player.mentalHealth,
        socialCapital: player.socialCapital
    });
    
    // Kolla om en händelse ska triggas
    let foundEvent = allEvents.find(e => e.age === player.age);
    if (foundEvent) {
        currentEvent = foundEvent;
        setupEvent(currentEvent);
    }
}

function setupEvent(eventData) {
    choiceButtons = [];
    let choices = eventData.getChoices(player);

    choices.forEach((choice, index) => {
        let btnY = 280 + index * 55;
        let btn = new Button(choice.text, 50, btnY, width - 100, 45, () => handleChoice(choice));
        
        // Här implementeras de strukturella hindren
        if (!choice.condition(player)) {
            btn.disabled = true;
            btn.tooltip = "Detta val är inte tillgängligt för dig på grund av din bakgrund eller tidigare val.";
        }
        choiceButtons.push(
