import fs from 'fs'
let instrukce  = '';
let instrukceJsou = false;

try {
    instrukce = fs.readFileSync('instrukce.txt', 'utf8');
    //console.log(instrukce);
    instrukceJsou = true;
} catch (error) {
    console.log('Soubor s instrukcemi neexistuje.');
}

if (instrukceJsou){
    const nazvy = instrukce.trim().split(/\s+/);
    const zdrojovaCesta = nazvy[0];
    const cilovaCesta = nazvy[1]; 
    if (fs.existsSync(zdrojovaCesta)) {
        const obsahZdroje = fs.readFileSync(zdrojovaCesta, 'utf8');
        fs.writeFileSync(cilovaCesta, obsahZdroje)
        console.log(`Obsah z "${zdrojovaCesta}" byl zkopírován do "${cilovaCesta}".`)
    } else {
        console.log(`Chyba. Soubor ${zdrojovaCesta} neexistuje.`)
    }
    
}