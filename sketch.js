// sketch.js

let gameState = 'startScreen';
let canvasWidth = 800;
let canvasHeight = 600;

let player;
let history = [];

let currentEvent = null;
let choiceButtons = [];
let nextYearButton;

function setup() {
    createCanvas(canvasWidth, canvasHeight);
    textFont('Arial');
    resetGame();
}

function resetGame() {
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
        year: 0,
        health: int(random(70, 95)),
        economy: 0,
        education: 0,
        socialCapital: 0,
        mentalHealth: int(random(65, 90)),
        log: [],
        timeline: []
    };
    
    // Sätt startvärden baserat på socioekonomisk status
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
    
    history = [];
    currentEvent = null;
    choiceButtons = [];

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

function drawStartScreen() {
    textAlign(CENTER, CENTER);
    fill(0);
    textSize(26);
    text('Livsbanan: En Simulering', width / 2, 80);

    textSize(16);
    fill(50);
    let startText = `Du föddes ${player.birthYear} som ${player.gender} i en ${player.ses}-familj i en ${player.location}.\n\nDina startförutsättningar kommer att forma dina möjligheter i livet. Vissa dörrar kommer att vara öppna, andra stängda.\n\nKlicka för att börja din resa.`;
    text(startText, width / 2, height / 2, width - 100, 300);
}

function drawGameScreen() {
    drawStatus();
    nextYearButton.hidden = (currentEvent !== null);
    nextYearButton.draw();

    if (currentEvent) {
        fill(0);
        textAlign(LEFT);
        textSize(20);
        text(currentEvent.title, 50, 180);
        
        fill(50);
        textSize(14);
        text(currentEvent.description, 50, 210, width - 100, 100);

        choiceButtons.forEach(btn => btn.draw());
    } else {
        textAlign(CENTER);
        let context = getHistoricalContext(player.year);
        if(context.contextText) {
            fill(150, 0, 0);
            textSize(12);
            text("Historisk händelse: " + context.contextText, width/2, height/2 - 50, width - 100, 100);
        }
    }
}

function drawStatus() {
    // Status panel
    fill(240);
    stroke(0);
    rect(50, 50, width - 100, 100);
    
    fill(0);
    textAlign(LEFT);
    textSize(16);
    text(`År: ${player.year} | Ålder: ${player.age}`, 60, 75);
    
    textSize(12);
    text(`Ekonomi: ${player.economy} | Utbildning: ${player.education}`, 60, 95);
    text(`Hälsa: ${player.health} | Mental hälsa: ${player.mentalHealth}`, 60, 110);
    text(`Socialt kapital: ${player.socialCapital}`, 60, 125);
}

function drawEndScreen() {
    background(10, 20, 30);
    textAlign(CENTER);
    fill(255);
    textSize(24);
    text("Din Livsbana: En sammanfattning", width / 2, 50);

    // Enkel graf över ekonomisk utveckling
    if (history.length > 1) {
        stroke(100, 255, 100);
        strokeWeight(2);
        noFill();
        beginShape();
        for (let i = 0; i < history.length; i++) {
            let x = map(i, 0, history.length - 1, 100, width - 100);
            let y = map(history[i].economy, 0, 100, height - 150, 150);
            vertex(x, y);
        }
        endShape();
        
        fill(100, 255, 100);
        noStroke();
        text("Ekonomisk utveckling", width/2, 120);
    }
    
    fill(200);
    textSize(14);
    text("Klicka för att reflektera över din resa.", width/2, height - 60);
    
    // Visa slutstatus
    textAlign(LEFT);
    fill(255);
    textSize(12);
    let finalText = `Slutstatus vid ${player.age} års ålder:\n`;
    finalText += `Ekonomi: ${player.economy}\n`;
    finalText += `Utbildning: ${player.education}\n`;
    finalText += `Hälsa: ${player.health}\n`;
    finalText += `Mental hälsa: ${player.mentalHealth}\n`;
    finalText += `Socialt kapital: ${player.socialCapital}`;
    
    text(finalText, 50, height - 150);
}

function drawReflectionScreen() {
    background(250);
    textAlign(LEFT);
    fill(0);
    textSize(22);
    text("Reflektion", 50, 50);

    textSize(14);
    let reflectionText = `Titta på din livsbana. Vilka faktorer hade störst inverkan?\n\n- Din socioekonomiska bakgrund (${player.ses}) påverkade dina möjligheter\n\n- Historiska händelser kunde förändra förutsättningarna\n\n- Vissa val var svårare att lyckas med - detta simulerar strukturella hinder\n\n- Spelet visar hur "fria val" verkar inom ramen för samhällets strukturer\n\nSpela gärna igen för att se ett annat livsöde.`;
    text(reflectionText, 50, 100, width-100, height-150);
    
    textSize(12);
    fill(100);
    text("Klicka för att starta en ny simulering.", 50, height-30);
}

function advanceTime() {
    if (currentEvent) return;

    if (player.age >= 65) {
        gameState = 'endScreen';
        return;
    }

    player.age++;
    player.year++;

    // Årliga förändringar
    let context = getHistoricalContext(player.year);
    player.mentalHealth = constrain(player.mentalHealth + context.mentalHealthModifier + random(-1, 1), 0, 100);
    player.health = constrain(player.health + random(-1, 0.5), 0, 100);

    // Spara status för grafen
    history.push({
        year: player.year,
        age: player.age,
        economy: player.economy,
        health: player.health,
        mentalHealth: player.mentalHealth,
        socialCapital: player.socialCapital
    });
    
    // Kolla efter händelser
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
        
        if (!choice.condition(player)) {
            btn.disabled = true;
            btn.tooltip = "Detta val är inte tillgängligt för dig på grund av din bakgrund eller tidigare val.";
        }
        choiceButtons.push(btn);
    });
}

function handleChoice(choice) {
    let success = random(100) > choice.difficulty;
    
    if (success) {
        choice.effect(player);
    } else {
        choice.failEffect(player);
    }
    
    // Begränsa värden
    player.economy = constrain(player.economy, 0, 100);
    player.education = constrain(player.education, 0, 100);
    player.socialCapital = constrain(player.socialCapital, 0, 100);
    player.mentalHealth = constrain(player.mentalHealth, 0, 100);
    player.health = constrain(player.health, 0, 100);
    
    currentEvent = null;
    choiceButtons = [];
}

function mousePressed() {
    switch (gameState) {
        case 'startScreen':
            gameState = 'gameRunning';
            break;
        case 'gameRunning':
            // Hantera knapptryck
            nextYearButton.click();
            choiceButtons.forEach(btn => btn.click());
            break;
        case 'endScreen':
            gameState = 'reflection';
            break;
        case 'reflection':
            resetGame();
            break;
    }
}
