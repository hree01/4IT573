import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';

const server = http.createServer(async (req, res) => {
    // req = co chce uzivatel, res = co dostane uzivatel
    console.log(`Požadavek na: ${req.url}`);

    try {
        let filePath;

        if (req.url === '/') {
            filePath = './index.html';
        } else {
        // spojeni nazvu 'public' a cesty z URL
            filePath = path.join('./public', req.url);
        }

        // reseni obrazku pomoci nastaveni hlavicek podle pripon
        const pripona = path.extname(filePath).toLowerCase();
        // mapa podporovanych typu
        const mimeTypes = {
            '.html': 'text/html',
            '.txt': 'text/plain',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.css': 'text/css',
            '.js': 'text/javascript'
        };
        const contentType = mimeTypes[pripona] || 'application/octet-stream'; // 'application/octet-stream' je univerzalni typ


        // pokus o precteni souboru
        const data = await fs.readFile(filePath);
        res.end(data); // odeslani dat uzivateli
        res.writeHead(200, { 'Content-Type': contentType });
    } catch (err) {
        let filePath = './404.html'
        const data = await fs.readFile(filePath);
        res.writeHead(404, { 'Content-Type': text/html });
        res.end(data); //
    }
});

server.listen(3000, () => {
    console.log('Server běží na http://localhost:3000');
});