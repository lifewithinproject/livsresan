// events.js

// Denna funktion simulerar övergripande samhällsförändringar.
// Den returnerar "modifiers" som påverkar spelet ett visst år.
function getHistoricalContext(year) {
    // 90-talskrisen
    if (year >= 1991 && year <= 1995) {
        return {
            contextText: "Sverige är i en djup ekonomisk kris. Arbetslösheten är hög och det är svårt att få jobb.",
            economyModifier: -15, // Svårare att lyckas ekonomiskt
            mentalHealthModifier: -5, // Generell stress i samhället
            jobAvailability: 0.5   // Färre jobb
        };
    }
    // IT-bubblan
    if (year >= 1998 && year <= 2001) {
        return {
            contextText: "IT-bubblan är på sin topp. Enorma möjligheter finns för den med rätt kompetens.",
            economyModifier: 10,
            mentalHealthModifier: 2,
            jobAvailability: 1.5
        };
    }
    // Finanskrisen
     if (year >= 2008 && year <= 2009) {
        return {
            contextText: "En global finanskris slår mot Sverige. Företag går i konkurs och varslen ökar.",
            economyModifier: -10,
            mentalHealthModifier: -3,
            jobAvailability: 0.7
        };
    }
    return { contextText: "", economyModifier: 0, mentalHealthModifier: 0, jobAvailability: 1.0 };
}


const allEvents = [
    {
        age: 16,
        title: "Gymnasieval",
        description: "Det är dags att välja väg i livet. Dina betyg och din bakgrund påverkar vilka dörrar som är öppna.",
        getChoices: (p) => [
            {
                text: "Välj ett yrkesprogram.",
                condition: () => true, // Alltid tillgängligt
                difficulty: 10, // Låg svårighetsgrad
                effect: (p) => { 
                    p.education += 10;
                    p.socialCapital += 5;
                    p.log.push("Valde ett praktiskt yrkesprogram.");
                },
                failEffect: (p) => {
                    p.mentalHealth -= 5;
                    p.log.push("Hade svårt att hänga med i yrkesprogrammet.");
                }
            },
            {
                text: "Välj ett studieförberedande program.",
                condition: () => p.education > 40, // Kräver hyfsad grundskola
                difficulty: 25,
                effect: (p) => {
                    p.education += 20;
                    p.mentalHealth -= 5; // Mer krävande
                    p.log.push("Satsade på ett teoretiskt gymnasieprogram.");
                },
                failEffect: (p) => {
                    p.education -= 5;
                    p.mentalHealth -= 10;
                    p.log.push("Kämpade med studierna och stressen på gymnasiet.");
                }
            }
        ]
    },
    {
        age: 22,
        title: "Söka till Universitet",
        description: "Efter gymnasiet står du inför valet att studera vidare. Detta är en stor investering i tid och pengar.",
        getChoices: (p) => [
            {
                text: "Sök till ett prestigefyllt universitet.",
                // Kräver hög utbildningsnivå och visst socialt/ekonomiskt stöd
                condition: () => p.education > 60 && (p.ses !== 'arbetarklass' || p.economy > 50),
                difficulty: 40, // Svårt att komma in och klara av
                effect: (p) => {
                    p.education += 30;
                    p.socialCapital += 20;
                    p.economy -= 15; // Studielån etc.
                    p.log.push("Kom in på ett prestigefyllt universitet och byggde ett starkt nätverk.");
                },
                failEffect: (p) => {
                    p.mentalHealth -= 10;
                    p.economy -= 10;
                    p.log.push("Blev inte antagen eller klarade inte av pressen på prestigeuniversitetet.");
                }
            },
            {
                text: "Sök till en lokal högskola.",
                condition: () => p.education > 50,
                difficulty: 15,
                effect: (p) => {
                    p.education += 20;
                    p.socialCapital += 10;
                    p.economy -= 10;
                    p.log.push("Läste på en lokal högskola och fick en stabil utbildning.");
                },
                failEffect: (p) => {
                    p.mentalHealth -= 5;
                    p.economy -= 5;
                    p.log.push("Hade svårt att finansiera eller klara studierna på högskolan.");
                }
            },
            {
                text: "Börja arbeta direkt istället.",
                condition: () => true,
                difficulty: 0,
                effect: (p) => {
                    p.economy += 15;
                    p.log.push("Valde att börja arbeta direkt efter gymnasiet.");
                },
                failEffect: () => {}
            }
        ]
    },
    {
        age: 28,
        title: "Etablera sig på arbetsmarknaden",
        description: "Du söker ett kvalificerat jobb. Läget i samhället påverkar dina chanser.",
        getChoices: (p) => [
            {
                text: "Sök jobb inom privat sektor.",
                condition: () => p.education > 55,
                // Svårigheten påverkas av historisk kontext
                difficulty: 30 - getHistoricalContext(p.year).economyModifier,
                effect: (p) => {
                    p.economy += 25;
                    p.mentalHealth -= 5; // Kan vara stressigt
                    p.log.push("Fick ett bra jobb inom det privata näringslivet.");
                },
                failEffect: (p) => {
                    p.economy -= 5;
                    p.mentalHealth -= 10;
                    p.log.push("Hade svårt att hitta ett stabilt
