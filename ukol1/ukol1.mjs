//myslim si cislo 0-10
//hadej uzivateli
//ne - je to mensi/vetsi (max 5 pokusu, jinak prohral, program konci)
//ano - vyhral, konec programu
//program v konzoli, Math.random() pro generovani, prompt() pro nacteni tipu

const nahoda = Math.floor(Math.random() * 11);

import promptSync from 'prompt-sync';
const prompt = promptSync();

// pro testovací účely
console.log(nahoda);

// použití funkce prompt (program se zde zastaví a počká na vstup)
let odhad;
let uhadnuto = false;

for(let i=1; i<=5; i++){
    odhad = Number(prompt(`Pokus č. ${i}. Jaké číslo si myslím? `));
    if  (odhad === nahoda) {
    console.log(`Trefa do černého, jsi mistr hadač. Povedlo se ti to na ${i}. pokus.`);
    uhadnuto = true;
    break;
    } else {
        //console.log(`Vedle. Zbývá ${5-i} pokusů`);
        if(nahoda>odhad && odhad>=0){
            console.log(`Vedle. Zbývá ${5-i} pokusů. Číslo, které si myslím, je větší než tvůj odhad.`);
        } else if (nahoda<odhad  && odhad<=10) {
            console.log(`Vedle. Zbývá ${5-i} pokusů. Číslo, které si myslím, je menší než tvůj odhad.`);
        } else {
            console.log('Zadej prosím číslo od 0 do 10.');
            i--;
        }
        //odhad = Number(prompt('Jaké číslo si myslím?'));
    }
}

if (!uhadnuto){
    console.log(`Vyčerpal jsi svých 5 pokusů. Prohrál jsi. Správné číslo bylo ${nahoda}.`);
}