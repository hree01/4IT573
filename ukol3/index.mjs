import fs from 'node:fs/promises';

try {
    const data = await fs.readFile('instrukce.txt', 'utf-8');
    const pocet = parseInt(data.trim()); // odstranim mezery

    console.log(`Budu vytvářet ${pocet} souborů...`);

    const poleSouboru = [];
    // for cyklus pro vytvoreni souboru
    for (let i = 1; i <= pocet; i++) {
        const nazev = `${i}.txt`;
        const obsah = `Soubor ${i}`;
        const slibenySoubor = fs.writeFile(nazev, obsah); // bez await
        poleSouboru.push(slibenySoubor); // pridam do pole slibenych souboru
        //await fs.writeFile(nazev, obsah);
    }
    await Promise.all(poleSouboru);
    console.log(`Hotovo. ${pocet} souborů bylo vytvořeno.`); 
    
} catch (error) {
    console.error('Chyba:', error);
}