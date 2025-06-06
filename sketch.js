// Spelets grundinställningar
let gameState = 'startScreen';
let canvasWidth = 800;
let canvasHeight = 600;

// Spelardata
let player = {
    birthYear: 1985,
    gender: 'kvinna',
    background: 'medelklass',
    location: 'medelstor stad',
    age: 0,
    year: 1985,
    health: 80,
    economy: 50,
    education: 50,
    timeline: []
};

// UI-element
let yearSlider;
let startButton;

// Händelsedata (förenklad, skulle ligga i data.js i ett större projekt)
const events = [
    {
        age: 7,
        title: "Skolstart",
        description: "Dags att börja skolan. Dina föräldrars bakgrund och din bostadsort påverkar vilken skola du hamnar i.",
        getChoices: (p) => {
            let choices = [{ text: "Börja i den lokala kommunala skolan.", effect: { education: 5, economy: 0 } }];
            // Friskolereformen 1992
            if (p.year >= 1992) {
                choices.push({ text: "Välj en nystartad friskola.", effect: { education: 8, economy: -2 } });
            }
            return choices;
        }
    },
    {
        age: 16,
        title: "Gymnasieval",
        description: "Du ska välja gymnasium. 90-talskrisen påverkar arbetsmarknaden och synen på utbildning.",
        getChoices: (p) => {
            let choices = [
                { text: "Välj ett yrkesprogram för en snabb väg till jobb.", effect: { education: 5, economy: 5 } },
                { text: "Välj ett studieförberedande program.", effect: { education: 10, economy: -5 } }
            ];
            // Om spelaren är ung under IT-bubblan sent 90-tal
            if (p.year > 1997 && p.year < 2002) {
                 choices.push({ text: "Satsa på en IT-utbildning, det är framtiden!", effect: { education: 12, economy: -3 } });
            }
            return choices;
        }
    }
];

let currentEvent = null;
let choiceButtons = [];

// Körs en gång när programmet startar
function setup() {
    createCanvas(canvasWidth, canvasHeight);
    textFont('Arial');

    // Skapa UI-element för startskärmen
    yearSlider = createSlider(1970, 2005, 1985, 1);
    yearSlider.position(width / 2 - 100, height / 2);
    yearSlider.style('width', '200px');

    startButton = createButton('Starta Livet');
    startButton.position(width / 2 - 50, height / 2 + 50);
    startButton.mousePressed(startGame);
}

// Huvudloopen, ritar om skärmen kontinuerligt
function draw() {
    background(245); // Ljusgrå bakgrund
    
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
    }
}

function drawStartScreen() {
    textAlign(CENTER);
    textSize(32);
    fill(0);
    text('Välj ditt födelseår', width / 2, height / 2 - 50);

    textSize(20);
    text(yearSlider.value(), width / 2, height / 2 - 20);
}

function drawGameScreen() {
    // Dölj start-UI
    yearSlider.hide();
    startButton.hide();

    // Rita ut spelar-status
    drawStatus();
    
    // Om det finns en aktiv händelse, visa den
    if (currentEvent) {
        textAlign(LEFT);
        fill(0);
        textSize(24);
        text(currentEvent.title, 50, 150);
        
        textSize(16);
        textWrap(WORD);
        text(currentEvent.description, 50, 200, width - 100);

        // Rita ut valknappar
        choiceButtons.forEach(btn => btn.draw());

    } else {
        // Gå vidare i tiden
        advanceTime();
    }
}

function drawStatus() {
    // Enkel status-bar
    fill(50);
    textSize(18);
    textAlign(LEFT);
    text(`År: ${player.year} | Ålder: ${player.age}`, 20, 30);
    
    // Rita mätare
    let stats = ['Hälsa', 'Ekonomi', 'Utbildning'];
    let values = [player.health, player.economy, player.education];
    
    for(let i=0; i<stats.length; i++) {
        let x = 20 + i * 150;
        let y = 60;
        fill(200);
        rect(x, y, 100, 20);
        fill(50, 150, 50);
        rect(x, y, values[i], 20);
        fill(0);
        textSize(14);
        text(stats[i], x, y - 5);
    }
}


function advanceTime() {
    player.age++;
    player.year++;

    // Leta efter en händelse som matchar spelarens ålder
    let foundEvent = events.find(e => e.age === player.age);
    if (foundEvent) {
        currentEvent = foundEvent;
        // Skapa knappar för valen
        let choices = currentEvent.getChoices(player);
        choiceButtons = [];
        choices.forEach((choice, index) => {
            let btn = new ChoiceButton(choice.text, 50, 300 + index * 50, 400, 40, () => {
                // Spara valet till tidslinjen
                player.timeline.push({year: player.year, age: player.age, choice: choice.text });

                // Applicera effekter
                player.education = constrain(player.education + choice.effect.education, 0, 100);
                player.economy = constrain(player.economy + choice.effect.economy, 0, 100);
                
                // Nollställ händelsen och fortsätt
                currentEvent = null;
            });
            choiceButtons.push(btn);
        });
    }

    // Villkor för att avsluta spelet
    if (player.age >= 40) {
        gameState = 'endScreen';
    }
    
    // Fördröjning för att det inte ska gå för fort
    frameRate(2);
}


function startGame() {
    player.birthYear = yearSlider.value();
    player.year = player.birthYear;
    gameState = 'gameRunning';
}

function mousePressed() {
    if (gameState === 'gameRunning' && currentEvent) {
        choiceButtons.forEach(btn => btn.checkClick(mouseX, mouseY));
    }
}

// En enkel knappklass
class ChoiceButton {
    constructor(label, x, y, w, h, callback) {
        this.label = label;
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.callback = callback;
    }

    draw() {
        // Rektangel
        stroke(0);
        fill(255);
        if (this.isMouseOver()) {
            fill(220);
        }
        rect(this.x, this.y, this.w, this.h, 5);

        // Text
        noStroke();
        fill(0);
        textAlign(CENTER, CENTER);
        textSize(14);
        text(this.label, this.x + this.w / 2, this.y + this.h / 2);
    }

    isMouseOver() {
        return mouseX > this.x && mouseX < this.x + this.w && mouseY > this.y && mouseY < this.y + this.h;
    }

    checkClick(px, py) {
        if (this.isMouseOver()) {
            this.callback();
        }
    }
}


// Slutskärmen
function drawEndScreen() {
    background(20, 20, 40); // Mörkblå bakgrund
    fill(255);
    textAlign(CENTER);
    textSize(32);
    text("Ditt liv har passerat", width/2, 80);

    textAlign(LEFT);
    textSize(16);

    text("Din livsbana:", 50, 150);
    
    // Rita ut tidslinjen
    player.timeline.forEach((event, index) => {
        let y = 200 + index * 30;
        fill(200);
        text(`År ${event.year} (Ålder ${event.age}): ${event.choice}`, 50, y);
    });
}
