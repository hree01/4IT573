function formatTime(isoString) {
    if (!isoString) return "00:00";
    const date = new Date(isoString);
    
    // kontrola, zda je datum validní
    if (isNaN(date.getTime())) return "00:00";

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

// export pro Node.js (Jest), aby mohl funkci otestovat
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { formatTime };
}