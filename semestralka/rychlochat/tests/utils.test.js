const { formatTime } = require('../src/utils');

describe('Testování pomocných funkcí (Utils)', () => {
    
    test('Měla by správně naformátovat ISO čas na HH:MM', () => {
        const testDate = new Date();
        testDate.setHours(14);
        testDate.setMinutes(35);
        
        const isoString = testDate.toISOString();
        const vysledek = formatTime(isoString);
        
        // zjišťování, co přesně má vyjít podle lokálního času stroje
        const expectedHours = String(testDate.getHours()).padStart(2, '0');
        const expectedMinutes = String(testDate.getMinutes()).padStart(2, '0');
        
        expect(vysledek).toBe(`${expectedHours}:${expectedMinutes}`);
    });

    test('Měla by vrátit "00:00" pro nevalidní vstup', () => {
        expect(formatTime('nesmyslny-text')).toBe('00:00');
        expect(formatTime(null)).toBe('00:00');
    });
});