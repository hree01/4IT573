import { serve } from '@hono/node-server';
import { createNodeWebSocket } from '@hono/node-ws';
import { app } from './src/app.js';
import { webSockets } from './src/websockets.js';


const port = 3000

const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app })

const server = serve(app, (info) => {
  console.log(`Server started on http://localhost:${info.port}`)
})

injectWebSocket(server)

app.get(
  '/ws',
  upgradeWebSocket((c) => ({
    onOpen: (evt, ws) => {
      webSockets.add(ws) // Přidáme klienta do seznamu
      console.log('Nové spojení, celkem aktivních:', webSockets.size)
    },
    onMessage: (evt, ws) => {
      console.log('Zpráva od klienta:', evt.data)
    },
    onClose: (evt, ws) => {
      webSockets.delete(ws) // Odstraníme klienta
      console.log('Spojení ukončeno, zbývá:', webSockets.size)
    },
  })),
)

